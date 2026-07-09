/* Firestore data-access helpers for auth, friends, and squads. Every
   function here is a thin wrapper around Firestore calls — no rendering,
   no app `state` mutation (that stays in social.js / app.js). All
   functions are no-ops or return null/false when `db`/`auth` aren't
   configured (see firebase-init.js), so the rest of the app can always
   call these safely. */

function randomCode(len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/* ---------- auth ---------- */
function signInWithGoogle() {
  if (!auth) return Promise.reject(new Error('Firebase not configured'));
  return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
}
function signOutUser() {
  if (!auth) return Promise.resolve();
  return auth.signOut();
}
function onAuthChange(callback) {
  if (!auth) return function unsubscribe() {};
  return auth.onAuthStateChanged(callback);
}

/* ---------- username ---------- */
async function isUsernameAvailable(username) {
  const doc = await db.collection('usernames').doc(username).get();
  return !doc.exists;
}
async function claimUsername(uid, username, displayName, photoURL) {
  const unameRef = db.collection('usernames').doc(username);
  const existing = await unameRef.get();
  if (existing.exists) throw new Error('That username is already taken');
  const batch = db.batch();
  batch.set(unameRef, { uid });
  batch.set(db.collection('users').doc(uid), { username, displayName: displayName || '', photoURL: photoURL || '', squadId: null }, { merge: true });
  await batch.commit();
}
async function getUserProfile(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}
async function findUserByUsername(username) {
  const unameDoc = await db.collection('usernames').doc(username).get();
  if (!unameDoc.exists) return null;
  const uid = unameDoc.data().uid;
  const profile = await getUserProfile(uid);
  return profile ? { uid, ...profile } : null;
}

/* ---------- own state cloud sync ---------- */
function pushStateToCloud(uid, stateObj) {
  if (!db) return Promise.resolve();
  return db.collection('userStates').doc(uid).set(JSON.parse(JSON.stringify(stateObj)));
}
async function pullStateFromCloud(uid) {
  const doc = await db.collection('userStates').doc(uid).get();
  return doc.exists ? doc.data() : null;
}
function listenToOwnState(uid, callback) {
  return db.collection('userStates').doc(uid).onSnapshot((doc) => { if (doc.exists) callback(doc.data()); });
}

/* ---------- shared progress projection ---------- */
function pushSharedProgress(uid, projection) {
  if (!db) return Promise.resolve();
  return db.collection('sharedProgress').doc(uid).set(projection);
}
function listenToSharedProgress(uid, callback) {
  return db.collection('sharedProgress').doc(uid).onSnapshot((doc) => callback(doc.exists ? doc.data() : null));
}

/* ---------- friends ---------- */
function friendshipId(uidA, uidB) { return [uidA, uidB].sort().join('_'); }
/* Request doc IDs are deterministic (fromUid_toUid), not auto-generated —
   this lets firestore.rules look up "is there an accepted request between
   these two uids" directly via a known path when authorizing a friendship
   doc's creation, which isn't possible against an auto-ID collection. */
function requestId(fromUid, toUid) { return fromUid + '_' + toUid; }
async function sendFriendRequest(fromUid, toUsername) {
  const target = await findUserByUsername(toUsername);
  if (!target) throw new Error('No user with that username');
  if (target.uid === fromUid) throw new Error("That's your own username");
  const id = friendshipId(fromUid, target.uid);
  const existingFriendship = await db.collection('friendships').doc(id).get();
  if (existingFriendship.exists) throw new Error("You're already friends");
  await db.collection('friendRequests').doc(requestId(fromUid, target.uid)).set({ fromUid, toUid: target.uid, status: 'pending', createdAt: Date.now() });
  return target;
}
function listenToIncomingRequests(uid, callback) {
  return db.collection('friendRequests').where('toUid', '==', uid).where('status', '==', 'pending')
    .onSnapshot((snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}
async function respondToFriendRequest(id, fromUid, toUid, accept) {
  const reqRef = db.collection('friendRequests').doc(id);
  if (!accept) { await reqRef.update({ status: 'declined' }); return; }
  const batch = db.batch();
  batch.update(reqRef, { status: 'accepted' });
  batch.set(db.collection('friendships').doc(friendshipId(fromUid, toUid)), { uids: [fromUid, toUid], viaCode: null, createdAt: Date.now() });
  await batch.commit();
}
function listenToFriends(uid, callback) {
  return db.collection('friendships').where('uids', 'array-contains', uid)
    .onSnapshot(async (snap) => {
      const friendUids = snap.docs.map((d) => d.data().uids.find((u) => u !== uid));
      const profiles = await Promise.all(friendUids.map((fid) => getUserProfile(fid).then((p) => ({ uid: fid, ...p }))));
      callback(profiles.filter(Boolean));
    });
}
async function createFriendInviteCode(uid) {
  const code = randomCode(6);
  await db.collection('inviteCodes').doc(code).set({ ownerUid: uid, type: 'friend', createdAt: Date.now() });
  return code;
}
async function redeemInviteCode(code, myUid) {
  const doc = await db.collection('inviteCodes').doc(code.toUpperCase()).get();
  if (!doc.exists) throw new Error('Invalid or expired code');
  const data = doc.data();
  if (data.ownerUid === myUid) throw new Error("That's your own code");
  const codeUpper = code.toUpperCase();
  if (data.type === 'friend') {
    const id = friendshipId(myUid, data.ownerUid);
    await db.collection('friendships').doc(id).set({ uids: [myUid, data.ownerUid], viaCode: codeUpper, createdAt: Date.now() });
    return { type: 'friend', uid: data.ownerUid };
  }
  if (data.type === 'squad') {
    await joinSquad(data.squadId, myUid, codeUpper);
    return { type: 'squad', squadId: data.squadId };
  }
}

/* ---------- squad + shared freeze pool ---------- */
async function createSquad(uid, name) {
  const ref = db.collection('squads').doc();
  await ref.set({ name, memberUids: [uid], freezePool: 0, createdAt: Date.now() });
  await db.collection('users').doc(uid).set({ squadId: ref.id }, { merge: true });
  return ref.id;
}
async function joinSquad(squadId, uid, viaCode) {
  const squadRef = db.collection('squads').doc(squadId);
  const squadDoc = await squadRef.get();
  if (!squadDoc.exists) throw new Error('Squad not found');
  const members = squadDoc.data().memberUids || [];
  const batch = db.batch();
  batch.update(squadRef, { memberUids: firebase.firestore.FieldValue.arrayUnion(uid), lastJoinCode: viaCode || null });
  batch.set(db.collection('users').doc(uid), { squadId }, { merge: true });
  members.filter((m) => m !== uid).forEach((m) => {
    batch.set(db.collection('friendships').doc(friendshipId(uid, m)), { uids: [uid, m], viaCode: viaCode || null, createdAt: Date.now() });
  });
  await batch.commit();
}
async function createSquadInviteCode(squadId, ownerUid) {
  const code = randomCode(6);
  await db.collection('inviteCodes').doc(code).set({ ownerUid, type: 'squad', squadId, createdAt: Date.now() });
  return code;
}
function listenToSquad(squadId, callback) {
  return db.collection('squads').doc(squadId).onSnapshot((doc) => callback(doc.exists ? { id: doc.id, ...doc.data() } : null));
}
function contributeFreezeToPool(squadId) {
  return db.collection('squads').doc(squadId).update({ freezePool: firebase.firestore.FieldValue.increment(1) });
}
async function spendFreezeFromPool(squadId) {
  const ref = db.collection('squads').doc(squadId);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const pool = doc.data().freezePool || 0;
    if (pool <= 0) throw new Error('No freezes left in the pool');
    tx.update(ref, { freezePool: pool - 1 });
  });
}
