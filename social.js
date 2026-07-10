/* Sign-in, username setup, friends, and squad — rendering + handlers.
   Everything here degrades gracefully when Firebase isn't configured
   (auth/db are null — see firebase-init.js): screens show an explanatory
   message instead of throwing. */
let socialState = {
  profile: null,
  needsUsername: false,
  friends: [],
  incomingRequests: [],
  squad: null,
  friendSearchQuery: '',
  usernameInput: '',
  inviteCodeInput: '',
  squadNameInput: '',
  pendingCloudState: null
};
let socialUnsubscribers = [];
let cloudPushTimer = null;

function clearSocialListeners() {
  socialUnsubscribers.forEach((fn) => { try { fn(); } catch (e) { /* already gone */ } });
  socialUnsubscribers = [];
  Object.keys(friendProgressUnsubscribers).forEach((k) => { friendProgressUnsubscribers[k](); delete friendProgressUnsubscribers[k]; });
}

function computeSharedProgress(stateObj) {
  const shared = stateObj.goals.filter((g) => g.shared);
  return {
    totalPoints: stateObj.garden.totalPoints,
    stage: stageFor(stateObj.garden.totalPoints).name,
    bestStreak: stateObj.goals.reduce((max, g) => Math.max(max, computeStats(g).longest), 0),
    sharedRoutines: shared.map((g) => ({ name: g.name, category: g.category, current: computeStats(g).current, points: pointsPerCompletion(g) }))
  };
}

let lastPushedStateJSON = null;
function scheduleCloudPush() {
  if (!isSignedIn()) return;
  if (cloudPushTimer) clearTimeout(cloudPushTimer);
  cloudPushTimer = setTimeout(() => {
    const uid = currentUid();
    const json = JSON.stringify(state);
    lastPushedStateJSON = json;
    pushStateToCloud(uid, state).catch(() => {});
    pushSharedProgress(uid, computeSharedProgress(state)).catch(() => {});
  }, 1200);
}
function mergeRemoteState(remote) {
  const json = JSON.stringify(remote);
  if (json === lastPushedStateJSON || json === JSON.stringify(state)) return; // our own echo, or no real change
  lastPushedStateJSON = json;
  state = normalizeState(remote);
  render();
  showToast('Synced from another device');
}

/* ---------- auth lifecycle ---------- */
const friendProgressUnsubscribers = {};
function watchFriendProgress(friend) {
  if (friendProgressUnsubscribers[friend.uid]) return;
  friendProgressUnsubscribers[friend.uid] = listenToSharedProgress(friend.uid, (progress) => {
    const f = socialState.friends.find((x) => x.uid === friend.uid);
    if (f) { f.sharedProgress = progress; if (view.name === 'friendsHub' || view.name === 'friendDetail') render(); }
  });
}
function startSocialListeners(uid) {
  clearSocialListeners();
  Object.keys(friendProgressUnsubscribers).forEach((k) => { friendProgressUnsubscribers[k](); delete friendProgressUnsubscribers[k]; });
  socialUnsubscribers.push(listenToOwnState(uid, mergeRemoteState));
  socialUnsubscribers.push(listenToFriends(uid, (friends) => {
    socialState.friends = friends.map((f) => ({ ...f, sharedProgress: null }));
    socialState.friends.forEach(watchFriendProgress);
    if (view.name === 'friendsHub' || view.name === 'friendDetail') render();
  }));
  socialUnsubscribers.push(listenToIncomingRequests(uid, async (reqs) => {
    const enriched = await Promise.all(reqs.map(async (r) => ({ ...r, fromUsername: (await getUserProfile(r.fromUid) || {}).username || r.fromUid })));
    socialState.incomingRequests = enriched;
    if (view.name === 'friendsHub') render();
  }));
  if (socialState.profile && socialState.profile.squadId) {
    socialUnsubscribers.push(listenToSquad(socialState.profile.squadId, async (squad) => {
      if (squad) squad.memberUsernames = await Promise.all(squad.memberUids.map(async (uid) => uid === currentUid() ? 'You' : (await getUserProfile(uid) || {}).username || uid));
      socialState.squad = squad;
      if (view.name === 'squadHub') render();
    }));
  }
}

async function handleSignedIn(user) {
  let profile = await getUserProfile(user.uid);
  if (!profile || !profile.username) {
    socialState.needsUsername = true;
    navStack = []; view = { name: 'usernameSetup' }; render();
    return;
  }
  socialState.profile = profile;
  socialState.needsUsername = false;

  const cloudState = await pullStateFromCloud(user.uid);
  if (cloudState && state.goals.length > 0) {
    socialState.pendingCloudState = cloudState;
    navStack = []; view = { name: 'migrationPrompt' }; render();
  } else if (cloudState) {
    state = normalizeState(cloudState);
    saveState();
    navStack = []; view = { name: 'home' }; render();
  } else {
    scheduleCloudPush();
    navStack = []; view = { name: 'home' }; render();
  }
  startSocialListeners(user.uid);
}

function handleSignedOut() {
  clearSocialListeners();
  socialState = { profile: null, needsUsername: false, friends: [], incomingRequests: [], squad: null, friendSearchQuery: '', usernameInput: '', inviteCodeInput: '', squadNameInput: '', pendingCloudState: null };
}

if (typeof auth !== 'undefined' && auth) {
  onAuthChange((user) => { if (user) handleSignedIn(user); else handleSignedOut(); });
}

/* ---------- rendering ---------- */
function googleSignInButtonHTML(action, label) {
  return `<button class="google-btn" data-action="${action}">
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.348 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
    <span>${label || 'Sign in with Google'}</span>
  </button>`;
}
function renderSignInHTML() {
  if (!FIREBASE_CONFIGURED) {
    return `${headerWithBack('Sign in')}<div class="screen">
      <p style="font-size:13px;color:var(--text-muted);">Cloud sync and friends need a Firebase project to be configured first — this app is running in local-only mode until then.</p>
    </div>${bottomNavHTML('home')}`;
  }
  return `${headerWithBack('Sign in')}<div class="screen">
    <div class="empty-state">
      <div class="emoji">🌱</div>
      <h3>Sync across devices, add friends</h3>
      <p>Sign in with Google to back up your data to the cloud and see friends' progress.</p>
      <div style="width:100%;max-width:280px;">${googleSignInButtonHTML('do-google-signin')}</div>
    </div>
  </div>${bottomNavHTML('home')}`;
}

function renderUsernameSetupHTML() {
  return `${headerWithBack('Choose a username')}<div class="screen">
    <p style="font-size:13px;color:var(--text-muted);margin-top:0;">This is how friends will find and add you.</p>
    <div class="form-group"><input type="text" id="username-input" placeholder="e.g. bhanu_habits" value="${escapeHtml(socialState.usernameInput)}" autocapitalize="none"></div>
    <button class="primary-btn" data-action="claim-username">Save username</button>
  </div>${bottomNavHTML('home')}`;
}

function renderMigrationPromptHTML() {
  return `${headerWithBack('Cloud data found')}<div class="screen">
    <p style="font-size:13px;color:var(--text-muted);margin-top:0;">This account already has data saved in the cloud, and this device also has local data. Which should we keep?</p>
    <div class="goal-card" style="display:block;">
      <button class="secondary-btn" data-action="migration-keep-cloud">Use cloud data (overwrite this device)</button>
      <button class="secondary-btn" style="margin-top:10px;" data-action="migration-keep-local">Use this device's data (overwrite the cloud)</button>
    </div>
  </div>${bottomNavHTML('home')}`;
}

function friendMiniCardHTML(friend) {
  const shared = friend.sharedProgress;
  return `<div class="goal-card" data-action="go-friend-detail" data-id="${friend.uid}" role="button" tabindex="0" aria-label="${escapeHtml(friend.username || 'friend')} details" style="display:flex;align-items:center;gap:12px;cursor:pointer;">
    <div style="width:44px;height:44px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--primary-light);display:flex;align-items:center;justify-content:center;">
      ${shared ? renderPlantSVG(shared.totalPoints, { size: 44 }) : '🌱'}
    </div>
    <div style="flex:1;min-width:0;">
      <div style="font-weight:700;font-size:14px;">${escapeHtml(friend.username || 'friend')}</div>
      <div style="font-size:12px;color:var(--text-muted);">${shared ? `${shared.stage} · best streak ${shared.bestStreak}` : 'No shared data yet'}</div>
    </div>
    <div class="chevron">${ICONS.chevronRight}</div>
  </div>`;
}

function renderFriendsHubHTML() {
  if (!isSignedIn()) return renderSignInHTML();
  const requestsSection = socialState.incomingRequests.length ? `<div class="section-label" style="margin-top:16px;">Friend requests</div>
    ${socialState.incomingRequests.map((r) => `<div class="goal-card" style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:13.5px;font-weight:600;">@${escapeHtml(r.fromUsername)}</div>
      <div style="display:flex;gap:8px;">
        <button class="secondary-btn" style="width:auto;padding:6px 12px;" data-action="respond-request" data-id="${r.id}" data-from="${r.fromUid}" data-accept="1">Accept</button>
        <button class="delete-link" style="margin:0;" data-action="respond-request" data-id="${r.id}" data-from="${r.fromUid}" data-accept="0">Decline</button>
      </div>
    </div>`).join('')}` : '';

  const friendsSection = socialState.friends.length
    ? socialState.friends.map(friendMiniCardHTML).join('')
    : `<p style="font-size:13px;color:var(--text-muted);text-align:center;">No friends yet — search a username or share your invite code below.</p>`;

  return `${headerWithBack('Friends')}<div class="screen">
    <div class="form-group">
      <input type="text" id="friend-search-input" placeholder="Search by username" value="${escapeHtml(socialState.friendSearchQuery)}">
      <button class="primary-btn" style="margin-top:8px;" data-action="send-friend-request">Send friend request</button>
    </div>
    <div class="form-group">
      <input type="text" id="invite-code-input" placeholder="Enter an invite code" value="${escapeHtml(socialState.inviteCodeInput)}">
      <button class="secondary-btn" style="margin-top:8px;" data-action="redeem-code">Redeem code</button>
      <button class="link-btn" style="margin-top:8px;" data-action="get-my-invite-code">Get my invite code</button>
    </div>
    ${requestsSection}
    <div class="section-label" style="margin-top:16px;">Your friends</div>
    ${friendsSection}
    <button class="secondary-btn" style="margin-top:16px;" data-action="go-squad">🛡️ Squad & shared freezes</button>
  </div>${bottomNavHTML('home')}`;
}

function renderFriendDetailHTML(uid) {
  const friend = socialState.friends.find((f) => f.uid === uid);
  if (!friend) { return renderFriendsHubHTML(); }
  const shared = friend.sharedProgress;
  const routines = shared && shared.sharedRoutines.length
    ? shared.sharedRoutines.map((r) => `<div class="subgoal-card">
        <div class="subgoal-emoji">${catOf(r.category).emoji}</div>
        <div class="subgoal-info">
          <div class="subgoal-title">${escapeHtml(r.name)}</div>
          <div class="subgoal-meta">${r.current}-day streak · +${r.points} pts</div>
        </div>
      </div>`).join('')
    : `<p style="font-size:13px;color:var(--text-muted);">${escapeHtml(friend.username)} hasn't shared any specific routines.</p>`;
  return `${headerWithBack('@' + escapeHtml(friend.username || 'friend'))}<div class="screen">
    <div class="garden-scene" style="background:${SCENE_BG_STYLES.bg_windowsill};">
      <div class="scene-plant-wrap">${shared ? renderPlantSVG(shared.totalPoints, { size: 150 }) : ''}</div>
    </div>
    <div class="goal-card" style="display:block;">
      <div style="display:flex;gap:10px;">
        <div class="plant-stat" style="flex:1;"><div class="num">${shared ? shared.stage : '—'}</div><div class="lbl">stage</div></div>
        <div class="plant-stat" style="flex:1;"><div class="num">${shared ? shared.bestStreak : 0}</div><div class="lbl">best streak</div></div>
      </div>
    </div>
    <div class="section-label" style="margin-top:16px;">Shared routines</div>
    ${routines}
  </div>${bottomNavHTML('home')}`;
}

function renderSquadHTML() {
  if (!isSignedIn()) return renderSignInHTML();
  if (!socialState.squad) {
    return `${headerWithBack('Squad')}<div class="screen">
      <p style="font-size:13px;color:var(--text-muted);margin-top:0;">Squads pool streak freezes — everyone contributes, anyone can spend one to cover a missed day.</p>
      <div class="form-group"><input type="text" id="squad-name-input" placeholder="Squad name" value="${escapeHtml(socialState.squadNameInput)}"></div>
      <button class="primary-btn" data-action="create-squad">Create a squad</button>
      <div class="form-group" style="margin-top:20px;"><input type="text" id="invite-code-input" placeholder="Enter a squad invite code" value="${escapeHtml(socialState.inviteCodeInput)}"></div>
      <button class="secondary-btn" data-action="redeem-code">Join with code</button>
    </div>${bottomNavHTML('home')}`;
  }
  const sq = socialState.squad;
  const names = sq.memberUsernames || sq.memberUids;
  const members = names.map((name) => `<div class="subgoal-card"><div class="subgoal-emoji">👤</div><div class="subgoal-info"><div class="subgoal-title">${escapeHtml(name)}</div></div></div>`).join('');
  return `${headerWithBack(sq.name)}<div class="screen">
    <div class="goal-card" style="display:block;text-align:center;">
      <div style="font-size:34px;font-weight:800;color:var(--primary-dark);">🧊 ${sq.freezePool}</div>
      <div class="lbl" style="color:var(--text-muted);font-size:12px;">freezes in the shared pool</div>
      <div style="display:flex;gap:10px;margin-top:14px;">
        <button class="secondary-btn" data-action="contribute-freeze" ${state.garden.freezeInventory < 1 ? 'disabled' : ''}>Contribute one of yours</button>
        <button class="secondary-btn" data-action="spend-pool-freeze" ${sq.freezePool < 1 ? 'disabled' : ''}>Use one for me</button>
      </div>
    </div>
    <div class="section-label" style="margin-top:16px;">Members (${sq.memberUids.length})</div>
    ${members}
    <button class="link-btn" style="margin-top:14px;" data-action="get-squad-invite-code">Get squad invite code</button>
  </div>${bottomNavHTML('home')}`;
}

/* ---------- handlers ---------- */
const socialHandlers = {
  'go-signin': () => { navStack.push(view); view = { name: 'signIn' }; render(); },
  'do-google-signin': () => { signInWithGoogle().catch((e) => showToast(e.message)); },
  'do-signout': () => { signOutUser(); navStack = []; view = { name: 'home' }; render(); },
  'claim-username': async () => {
    const uname = (socialState.usernameInput || '').trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(uname)) { showToast('Use 3-20 letters, numbers, or underscores'); return; }
    try {
      await claimUsername(currentUid(), uname, auth.currentUser.displayName, auth.currentUser.photoURL);
      socialState.needsUsername = false;
      showToast('Username saved!');
      handleSignedIn(auth.currentUser);
    } catch (e) { showToast(e.message); }
  },
  'migration-keep-cloud': () => {
    state = normalizeState(socialState.pendingCloudState);
    saveState();
    socialState.pendingCloudState = null;
    navStack = []; view = { name: 'home' }; render();
    showToast('Loaded your cloud data');
  },
  'migration-keep-local': () => {
    socialState.pendingCloudState = null;
    scheduleCloudPush();
    navStack = []; view = { name: 'home' }; render();
    showToast('Kept this device\'s data');
  },
  'go-friends-hub': () => { navStack.push(view); view = { name: 'friendsHub' }; render(); },
  'go-friend-detail': (el) => { navStack.push(view); view = { name: 'friendDetail', friendUid: el.dataset.id }; render(); },
  'go-squad': () => { navStack.push(view); view = { name: 'squadHub' }; render(); },
  'send-friend-request': async () => {
    const uname = (socialState.friendSearchQuery || '').trim().toLowerCase();
    if (!uname) { showToast('Enter a username first'); return; }
    try { await sendFriendRequest(currentUid(), uname); showToast('Friend request sent'); socialState.friendSearchQuery = ''; render(); }
    catch (e) { showToast(e.message); }
  },
  'respond-request': async (el) => {
    try { await respondToFriendRequest(el.dataset.id, el.dataset.from, currentUid(), el.dataset.accept === '1'); showToast(el.dataset.accept === '1' ? 'Friend added' : 'Request declined'); }
    catch (e) { showToast(e.message); }
  },
  'redeem-code': async () => {
    const code = (socialState.inviteCodeInput || '').trim();
    if (!code) { showToast('Enter a code first'); return; }
    try {
      const result = await redeemInviteCode(code, currentUid());
      socialState.inviteCodeInput = '';
      if (result.type === 'squad') { const profile = await getUserProfile(currentUid()); socialState.profile = profile; startSocialListeners(currentUid()); }
      showToast('Connected!');
      render();
    } catch (e) { showToast(e.message); }
  },
  'get-my-invite-code': async () => {
    try { const code = await createFriendInviteCode(currentUid()); showToast(`Your invite code: ${code}`); }
    catch (e) { showToast(e.message); }
  },
  'create-squad': async () => {
    const name = (socialState.squadNameInput || '').trim();
    if (!name) { showToast('Name your squad first'); return; }
    try {
      const squadId = await createSquad(currentUid(), name);
      socialState.profile = await getUserProfile(currentUid());
      startSocialListeners(currentUid());
      showToast('Squad created');
      render();
    } catch (e) { showToast(e.message); }
  },
  'get-squad-invite-code': async () => {
    if (!socialState.squad) return;
    try { const code = await createSquadInviteCode(socialState.squad.id, currentUid()); showToast(`Squad code: ${code}`); }
    catch (e) { showToast(e.message); }
  },
  'contribute-freeze': async () => {
    if (!socialState.squad || state.garden.freezeInventory < 1) return;
    try {
      await contributeFreezeToPool(socialState.squad.id);
      state.garden.freezeInventory -= 1;
      saveState(); render();
      showToast('Contributed a freeze to the squad');
    } catch (e) { showToast(e.message); }
  },
  'spend-pool-freeze': async () => {
    if (!socialState.squad) return;
    try {
      await spendFreezeFromPool(socialState.squad.id);
      state.garden.freezeInventory += 1;
      saveState(); render();
      showToast('Freeze added to your inventory');
    } catch (e) { showToast(e.message); }
  },
  'toggle-routine-shared': (el) => {
    const g = state.goals.find((x) => x.id === el.dataset.id);
    if (!g) return;
    g.shared = !g.shared;
    saveState();
    render();
  }
};
