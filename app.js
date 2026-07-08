/* Routine tracker (formerly Streakly) — v2
   Categories, flexible frequency, points, adaptive/purist modes,
   a growing plant companion, and templates.
   Vanilla JS, localStorage-backed, no build step. */

const STORAGE_KEY = 'routinetracker_data_v2';

const ICONS = {
  home: '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  leaf: '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 9-10 1 5 3 6 5 8a7 7 0 0 1-7 9z"/><path d="M5 21c4-4 8-6 12-12"/></svg>',
  chart: '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>',
  plus: '<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  chevronRight: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  back: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  shop: '<svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2l1.5 5h9L18 2"/><path d="M3.5 7h17l-1 13a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z"/><path d="M9 11a3 3 0 0 0 6 0"/></svg>',
  bolt: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 10-13h-7z"/></svg>'
};

const CATEGORIES = [
  { id: 'movement', emoji: '🏃', name: 'Movement' },
  { id: 'nutrition', emoji: '🥗', name: 'Nutrition' },
  { id: 'sleep', emoji: '😴', name: 'Sleep' },
  { id: 'mind', emoji: '📚', name: 'Mind & growth' },
  { id: 'wellness', emoji: '🧘', name: 'Mental wellness' },
  { id: 'selfcare', emoji: '🧴', name: 'Self-care' },
  { id: 'custom', emoji: '✨', name: 'Custom' }
];

const TIERS = [
  { id: 'micro', name: 'Micro', points: 1, hint: '< 5 min' },
  { id: 'easy', name: 'Easy', points: 2, hint: '5-15 min' },
  { id: 'moderate', name: 'Moderate', points: 3, hint: '15-45 min' },
  { id: 'hard', name: 'Hard', points: 5, hint: '45 min+' },
  { id: 'extreme', name: 'Extreme', points: 8, hint: 'compound ask' }
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STAGES = [
  { name: 'Seed', min: 0, emoji: '🌰' },
  { name: 'Sprout', min: 20, emoji: '🌱' },
  { name: 'Sapling', min: 75, emoji: '🌿' },
  { name: 'Young tree', min: 200, emoji: '🪴' },
  { name: 'Blooming', min: 500, emoji: '🌸' },
  { name: 'Flourishing', min: 1000, emoji: '🌳' }
];

const SHOP_ITEMS = [
  { id: 'freeze', name: 'Streak freeze', cost: 25, type: 'freeze', emoji: '🧊' },
  { id: 'pot_ceramic', name: 'Ceramic pot', cost: 40, type: 'pot', emoji: '🏺' },
  { id: 'pot_copper', name: 'Copper pot', cost: 70, type: 'pot', emoji: '🍯' },
  { id: 'bg_greenhouse', name: 'Greenhouse', cost: 60, type: 'background', emoji: '🏡' },
  { id: 'bg_garden', name: 'Garden bed', cost: 90, type: 'background', emoji: '🌷' },
  { id: 'deco_lights', name: 'Fairy lights', cost: 50, type: 'decoration', emoji: '✨' },
  { id: 'deco_stones', name: 'Pebble stones', cost: 20, type: 'decoration', emoji: '🪨' }
];
const DEFAULT_POT = { id: 'pot_terracotta', name: 'Terracotta pot', emoji: '🪴' };
const DEFAULT_BG = { id: 'bg_windowsill', name: 'Windowsill', emoji: '🪟' };

const TEMPLATES = [
  {
    id: '75hard',
    name: '75 Hard',
    description: 'The original 5-rule, 75-day mental toughness challenge.',
    supportsMode: true,
    activities: [
      { name: 'Structured diet, no alcohol', category: 'nutrition', frequency: { type: 'daily' }, tier: 'hard' },
      { name: 'Drink a gallon of water', category: 'nutrition', frequency: { type: 'daily' }, tier: 'moderate' },
      { name: 'Workout 1 (45 min)', category: 'movement', frequency: { type: 'daily' }, tier: 'hard' },
      { name: 'Workout 2, outdoors (45 min)', category: 'movement', frequency: { type: 'daily' }, tier: 'hard' },
      { name: 'Read 10 pages', category: 'mind', frequency: { type: 'daily' }, tier: 'easy' },
      { name: 'Progress photo', category: 'selfcare', frequency: { type: 'daily' }, tier: 'micro' }
    ]
  },
  {
    id: 'atomic_starter',
    name: 'Atomic habits starter',
    description: "Three tiny habits, one per area, so you don't overload on day one.",
    supportsMode: false,
    activities: [
      { name: 'Glass of water on waking', category: 'nutrition', frequency: { type: 'daily' }, tier: 'micro' },
      { name: 'Read 10 pages', category: 'mind', frequency: { type: 'daily' }, tier: 'easy' },
      { name: '10-minute walk', category: 'movement', frequency: { type: 'daily' }, tier: 'easy' }
    ]
  },
  {
    id: 'skincare_ampm',
    name: 'Skincare AM/PM',
    description: 'A simple twice-daily routine, with a weekly treatment.',
    supportsMode: false,
    activities: [
      { name: 'Cleanser', category: 'selfcare', frequency: { type: 'times_per_day', timesPerDay: 2 }, tier: 'micro' },
      { name: 'Moisturizer', category: 'selfcare', frequency: { type: 'times_per_day', timesPerDay: 2 }, tier: 'micro' },
      { name: 'Retinol', category: 'selfcare', frequency: { type: 'times_per_week', timesPerWeek: 2 }, tier: 'easy' }
    ]
  }
];

const QUOTES = [
  "Small consistent actions beat big sporadic ones.",
  "You don't need motivation, you need a trigger.",
  "Every check-in is a vote for the person you're becoming.",
  "Progress, not perfection.",
  "Consistency compounds — trust the process.",
  "Show up small, show up daily.",
  "One missed day is a blip. Two in a row is a pattern."
];

let state = { goals: [], garden: null };
let view = { name: 'home', goalId: null, templateId: null };
let navStack = [];
let form = null;
let pendingImport = null;

/* ---------- date helpers ---------- */
function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function toISO(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function todayISO() { return toISO(new Date()); }
function addDays(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return toISO(d);
}
function dayOfWeek(dateStr) { return new Date(dateStr + 'T00:00:00').getDay(); }
function heatDays(today, n) {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) arr.push(addDays(today, -i));
  return arr;
}
function mondayOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toISO(d);
}
function formatFriendly(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function catOf(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]; }
function tierOf(id) { return TIERS.find(t => t.id === id) || TIERS[0]; }

/* ---------- persistence ---------- */
function defaultGarden() {
  return {
    totalPoints: 0,
    balance: 0,
    freezeInventory: 0,
    unlocked: [],
    equipped: { pot: DEFAULT_POT.id, background: DEFAULT_BG.id, decoration: null }
  };
}
function normalizeState(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  if (!parsed.garden || typeof parsed.garden !== 'object') parsed.garden = defaultGarden();
  if (!Array.isArray(parsed.goals)) parsed.goals = [];
  parsed.goals.forEach(g => {
    if (!g.checkins) g.checkins = {};
    if (!g.freezesApplied) g.freezesApplied = {};
    if (!g.freezeDismissed) g.freezeDismissed = {};
  });
  return parsed;
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const normalized = normalizeState(JSON.parse(raw));
      if (normalized) return normalized;
    }
  } catch (e) { /* ignore corrupt data */ }
  return { goals: [], garden: defaultGarden() };
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* ---------- frequency / scheduling ---------- */
function freqMultiplier(goal) {
  const f = goal.frequency;
  if (f.type === 'weekdays') { const n = f.days.length; return n <= 1 ? 1.2 : n <= 3 ? 1.1 : 1.0; }
  if (f.type === 'times_per_week') { const n = f.timesPerWeek; return n <= 1 ? 1.2 : n <= 3 ? 1.1 : 1.0; }
  return 1.0;
}
function pointsPerCompletion(goal) {
  return Math.round(tierOf(goal.tier).points * freqMultiplier(goal));
}
function isScheduled(goal, dateStr) {
  if (dateStr < goal.createdAt) return false;
  const f = goal.frequency;
  if (f.type === 'weekdays') return f.days.includes(dayOfWeek(dateStr));
  if (f.type === 'times_per_week') return false; // not day-scheduled
  return true; // daily, times_per_day
}
function targetForDay(goal, dateStr) {
  const f = goal.frequency;
  if (f.type === 'times_per_day') return f.timesPerDay;
  if (!isScheduled(goal, dateStr)) return 0;
  return 1;
}
function completionsOn(goal, dateStr) { return goal.checkins[dateStr] || 0; }
function isDayComplete(goal, dateStr) {
  const target = targetForDay(goal, dateStr);
  if (target === 0) return null;
  return completionsOn(goal, dateStr) >= target;
}
function freqLabel(goal) {
  const f = goal.frequency;
  if (f.type === 'daily') return 'Every day';
  if (f.type === 'times_per_day') return f.timesPerDay + 'x a day';
  if (f.type === 'weekdays') return f.days.slice().sort().map(d => DAY_FULL[d]).join(', ');
  if (f.type === 'times_per_week') return f.timesPerWeek + 'x a week';
  return '';
}

/* ---------- stats ---------- */
function computeDailyStats(goal) {
  const end = todayISO();
  if (end < goal.createdAt) return { current: 0, longest: 0, total: 0 };
  let d = goal.createdAt;
  let run = 0, longest = 0, total = 0;
  while (true) {
    const frozen = goal.freezesApplied && goal.freezesApplied[d];
    if (!frozen && isScheduled(goal, d)) {
      const target = targetForDay(goal, d);
      const done = completionsOn(goal, d) >= target;
      if (done) { run++; total++; if (run > longest) longest = run; }
      else if (d !== end) { run = 0; }
    }
    if (d === end) break;
    d = addDays(d, 1);
  }
  if (run > longest) longest = run;
  return { current: run, longest, total };
}
function computeWeeklyStats(goal) {
  const today = todayISO();
  const currentWeek = mondayOf(today);
  let wk = mondayOf(goal.createdAt);
  if (wk > currentWeek) return { current: 0, longest: 0, total: 0, thisWeekCount: 0, weeklyTarget: goal.frequency.timesPerWeek };
  let run = 0, longest = 0, total = 0, thisWeekCount = 0;
  while (true) {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(wk, i);
      if (d < goal.createdAt || d > today) continue;
      count += completionsOn(goal, d);
    }
    if (wk === currentWeek) thisWeekCount = count;
    const done = count >= goal.frequency.timesPerWeek;
    if (done) { run++; total++; if (run > longest) longest = run; }
    else if (wk !== currentWeek) { run = 0; }
    if (wk === currentWeek) break;
    wk = addDays(wk, 7);
  }
  if (run > longest) longest = run;
  return { current: run, longest, total, thisWeekCount, weeklyTarget: goal.frequency.timesPerWeek };
}
function computeStats(goal) {
  return goal.frequency.type === 'times_per_week' ? computeWeeklyStats(goal) : computeDailyStats(goal);
}
function last7Days(today) { return heatDays(today, 7); }

/* ---------- garden / plant ---------- */
function stageFor(points) {
  let s = STAGES[0];
  for (const st of STAGES) if (points >= st.min) s = st;
  return s;
}
function nextStageFor(points) { return STAGES.find(st => st.min > points) || null; }
function todayVitality() {
  const today = todayISO();
  let eligible = 0, done = 0;
  state.goals.forEach(g => {
    if (g.frequency.type === 'times_per_week') return;
    const target = targetForDay(g, today);
    if (target > 0) { eligible++; if (completionsOn(g, today) >= target) done++; }
  });
  if (eligible === 0) return 1;
  return done / eligible;
}
function addPoints(delta) {
  if (delta > 0) state.garden.totalPoints += delta;
  state.garden.balance = Math.max(0, state.garden.balance + delta);
}
function itemOwned(id) { return state.garden.unlocked.includes(id); }
function equippedItem(type) {
  const id = state.garden.equipped[type];
  if (type === 'pot' && id === DEFAULT_POT.id) return DEFAULT_POT;
  if (type === 'background' && id === DEFAULT_BG.id) return DEFAULT_BG;
  return SHOP_ITEMS.find(i => i.id === id) || null;
}

/* ---------- freeze prompts (adaptive mode only) ---------- */
function goalMissedYesterday(goal) {
  if (goal.mode !== 'adaptive' || goal.frequency.type === 'times_per_week') return false;
  const yesterday = addDays(todayISO(), -1);
  if (yesterday < goal.createdAt) return false;
  if (goal.freezesApplied && goal.freezesApplied[yesterday]) return false;
  if (goal.freezeDismissed && goal.freezeDismissed[yesterday]) return false;
  const target = targetForDay(goal, yesterday);
  if (target === 0) return false;
  return completionsOn(goal, yesterday) < target;
}
function canRetroFreezeYesterday(goal) {
  if (goal.mode !== 'adaptive' || goal.frequency.type === 'times_per_week') return false;
  const yesterday = addDays(todayISO(), -1);
  if (yesterday < goal.createdAt) return false;
  if (goal.freezesApplied && goal.freezesApplied[yesterday]) return false;
  if (!(goal.freezeDismissed && goal.freezeDismissed[yesterday])) return false;
  const target = targetForDay(goal, yesterday);
  if (target === 0) return false;
  return completionsOn(goal, yesterday) < target;
}

/* ---------- rendering helpers ---------- */
function headerWithBack(title) {
  return `<div class="header">
    <button class="header-icon-btn" data-action="go-back" aria-label="Back">${ICONS.back}</button>
    <h1 style="font-size:17px;">${title}</h1>
    <div style="width:38px;"></div>
  </div>`;
}
function bottomNavHTML(active) {
  return `<div class="bottom-nav">
    <button class="nav-btn ${active === 'home' ? 'active' : ''}" data-action="go-home">${ICONS.home}Home</button>
    <button class="nav-btn ${active === 'garden' ? 'active' : ''}" data-action="go-garden">${ICONS.leaf}Garden</button>
    <button class="nav-btn ${active === 'insights' ? 'active' : ''}" data-action="go-insights">${ICONS.chart}Insights</button>
  </div>`;
}
function plantCardHTML() {
  const g = state.garden;
  const stage = stageFor(g.totalPoints);
  const next = nextStageFor(g.totalPoints);
  const pct = next ? Math.round(((g.totalPoints - stage.min) / (next.min - stage.min)) * 100) : 100;
  const vitality = todayVitality();
  const opacity = (0.55 + 0.45 * vitality).toFixed(2);
  return `<div class="plant-card">
    <div class="plant-card-top">
      <div class="plant-avatar" id="plant-avatar" style="opacity:${opacity};">${stage.emoji}</div>
      <div class="plant-info">
        <div class="plant-stage-name">${stage.name}${next ? '' : ' (fully grown)'}</div>
        <div class="plant-progress-track"><div class="plant-progress-fill" style="width:${next ? pct : 100}%;"></div></div>
        <div class="plant-sub">${next ? (next.min - g.totalPoints) + ' pts to ' + next.name : 'Maxed out — new stages coming soon'}</div>
      </div>
    </div>
    <div class="plant-stats-row">
      <div class="plant-stat"><div class="num">${g.balance}</div><div class="lbl">points</div></div>
      <div class="plant-stat"><div class="num">${g.freezeInventory}</div><div class="lbl">freezes</div></div>
      <button class="plant-shop-btn" data-action="go-garden">${ICONS.shop}Shop</button>
    </div>
  </div>`;
}
function freezeBannerHTML(goal) {
  const yesterday = addDays(todayISO(), -1);
  const hasFreeze = state.garden.freezeInventory > 0;
  return `<div class="freeze-banner">
    Missed yesterday${hasFreeze ? ' — use a freeze to keep the streak?' : ' — streak will reset. Freezes are in the Garden shop.'}
    <div class="actions">
      ${hasFreeze ? `<button data-action="use-freeze" data-id="${goal.id}" data-date="${yesterday}">Use freeze</button>` : ''}
      <button class="ghost" data-action="dismiss-freeze" data-id="${goal.id}" data-date="${yesterday}">${hasFreeze ? 'No, reset' : 'OK'}</button>
    </div>
  </div>`;
}
function goalCardHTML(g, today) {
  const cat = catOf(g.category);
  const isWeekly = g.frequency.type === 'times_per_week';
  const stats = computeStats(g);
  let circleClass = '', circleContent = '', tapAction = '';
  if (isWeekly) {
    const done = stats.thisWeekCount >= stats.weeklyTarget;
    circleClass = done ? 'done' : (stats.thisWeekCount > 0 ? 'partial' : '');
    circleContent = done ? ICONS.check : (stats.thisWeekCount + '/' + stats.weeklyTarget);
    tapAction = `data-action="toggle-checkin" data-id="${g.id}"`;
  } else {
    const scheduled = isScheduled(g, today);
    const target = targetForDay(g, today);
    const count = completionsOn(g, today);
    if (!scheduled) { circleClass = 'rest'; circleContent = '·'; }
    else if (count >= target) { circleClass = 'done'; circleContent = ICONS.check; tapAction = `data-action="toggle-checkin" data-id="${g.id}"`; }
    else if (count > 0) { circleClass = 'partial'; circleContent = count + '/' + target; tapAction = `data-action="toggle-checkin" data-id="${g.id}"`; }
    else { circleContent = target > 1 ? ('0/' + target) : ''; tapAction = `data-action="toggle-checkin" data-id="${g.id}"`; }
  }
  const miniHeat = isWeekly ? '' : `<div class="mini-heat" style="display:flex;gap:3px;margin-top:6px;">${last7Days(today).map(d => {
    let cls = '';
    if (d >= g.createdAt) {
      const t = targetForDay(g, d);
      if (t === 0) cls = 'rest-day';
      else if (completionsOn(g, d) >= t) cls = 'on';
      else if (d < today) cls = 'miss';
    }
    return `<span style="width:9px;height:9px;border-radius:3px;${cls === 'on' ? 'background:var(--primary);' : cls === 'miss' ? 'background:#E7BDAF;' : cls === 'rest-day' ? 'background:transparent;border:1.5px dashed var(--border);' : 'background:var(--border);'}"></span>`;
  }).join('')}</div>`;
  const banner = goalMissedYesterday(g) ? freezeBannerHTML(g) : '';
  const circleA11y = tapAction ? `role="button" tabindex="0" aria-label="${escapeHtml(g.name)} — mark complete" aria-pressed="${circleClass === 'done'}"` : '';
  return `<div class="goal-card" data-goal-swipe="${g.id}">
    <div class="goal-card-inner">
      <div class="check-circle ${circleClass}" ${tapAction} ${circleA11y}>${circleContent}</div>
      <div class="goal-card-info" data-action="go-detail" data-id="${g.id}" role="button" tabindex="0" aria-label="${escapeHtml(g.name)} details">
        <div class="goal-name">${cat.emoji} ${escapeHtml(g.name)}</div>
        <div class="goal-meta"><span class="streak-pill">${ICONS.bolt}${stats.current}</span><span class="pts-pill">+${pointsPerCompletion(g)}</span><span>${freqLabel(g)}</span></div>
        ${miniHeat}
        ${banner}
      </div>
      <div class="chevron" aria-hidden="true">${ICONS.chevronRight}</div>
    </div>
  </div>`;
}

function renderHomeHTML() {
  const today = todayISO();
  let body;
  if (state.goals.length === 0) {
    body = `<div class="empty-state">
      <div class="emoji">🌱</div>
      <h3>Nothing planted yet</h3>
      <p>Add a routine, or start from a template built around proven habit science.</p>
      <button class="primary-btn" data-action="go-add" style="width:auto;padding:13px 24px;margin-bottom:10px;">+ Add a routine</button>
      <button class="link-btn" data-action="go-templates">Browse templates ${ICONS.chevronRight}</button>
    </div>`;
  } else {
    const todos = state.goals.filter(g => {
      if (g.frequency.type === 'times_per_week') return true;
      return isScheduled(g, today);
    });
    const allDone = todos.length > 0 && todos.every(g => {
      if (g.frequency.type === 'times_per_week') { const s = computeStats(g); return s.thisWeekCount >= s.weeklyTarget; }
      return isDayComplete(g, today);
    });
    const bulkBtn = (todos.length > 1 && !allDone) ? `<button class="complete-all-btn" data-action="complete-all">${ICONS.check} Complete all for today</button>` : '';
    body = plantCardHTML() + `<div class="section-label">Today</div>` + bulkBtn + state.goals.map(g => goalCardHTML(g, today)).join('');
  }
  return `
    <div class="header"><div><h1>Routines</h1><div class="subtitle">${formatFriendly(today)}</div></div></div>
    <div class="screen">${body}</div>
    <button class="fab" data-action="go-add" aria-label="Add a routine">${ICONS.plus}</button>
    ${bottomNavHTML('home')}
  `;
}

function renderGardenHTML() {
  const g = state.garden;
  const stage = stageFor(g.totalPoints);
  const pot = equippedItem('pot');
  const bg = equippedItem('background');
  const deco = g.equipped.decoration ? SHOP_ITEMS.find(i => i.id === g.equipped.decoration) : null;
  const shop = SHOP_ITEMS.map(item => {
    const owned = itemOwned(item.id);
    const equipped = item.type !== 'freeze' && g.equipped[item.type] === item.id;
    let btnLabel, btnClass, disabled = '';
    if (item.type === 'freeze') { btnLabel = 'Buy · ' + item.cost; btnClass = ''; if (g.balance < item.cost) disabled = 'disabled'; }
    else if (equipped) { btnLabel = 'Equipped'; btnClass = 'equipped'; disabled = 'disabled'; }
    else if (owned) { btnLabel = 'Equip'; btnClass = 'owned'; }
    else { btnLabel = 'Buy · ' + item.cost; btnClass = ''; if (g.balance < item.cost) disabled = 'disabled'; }
    return `<div class="shop-item">
      <span class="emoji">${item.emoji}</span>
      <div class="name">${item.name}</div>
      <button class="${btnClass}" ${disabled} data-action="shop-buy" data-id="${item.id}">${btnLabel}</button>
    </div>`;
  }).join('');
  return `
    <div class="header"><div><h1>Garden</h1><div class="subtitle">${stage.name} · ${g.totalPoints} lifetime points</div></div></div>
    <div class="screen">
      <div class="plant-card">
        <div style="text-align:center;padding:12px 0;">
          <div style="font-size:64px;">${stage.emoji}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:6px;">${pot.emoji} ${pot.name} · ${bg.emoji} ${bg.name}${deco ? ' · ' + deco.emoji + ' ' + deco.name : ''}</div>
        </div>
      </div>
      <div class="plant-stats-row" style="margin-bottom:20px;">
        <div class="plant-stat"><div class="num">${g.balance}</div><div class="lbl">points</div></div>
        <div class="plant-stat"><div class="num">${g.freezeInventory}</div><div class="lbl">freezes</div></div>
        <div class="plant-stat"><div class="num">${state.goals.length}</div><div class="lbl">routines</div></div>
      </div>
      <div class="section-label">Shop</div>
      <div class="shop-grid">${shop}</div>
    </div>
    ${bottomNavHTML('garden')}
  `;
}

function dataBackupCardHTML() {
  if (pendingImport) {
    return `<div class="goal-card" style="display:block;">
      <div class="section-label" style="margin-bottom:6px;">Import data</div>
      <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px;">This replaces all current routines, points, and history on this device. This cannot be undone.</p>
      <div style="display:flex;gap:10px;">
        <button class="secondary-btn" style="width:auto;padding:10px 18px;" data-action="cancel-import">Cancel</button>
        <button class="primary-btn" style="width:auto;padding:10px 18px;margin-top:0;background:var(--accent-dark);" data-action="confirm-import">Yes, replace my data</button>
      </div>
    </div>`;
  }
  return `<div class="goal-card" style="display:block;">
    <div class="section-label" style="margin-bottom:6px;">Data &amp; backup</div>
    <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px;">Your data lives only in this browser. Export a backup so you don't lose it.</p>
    <div style="display:flex;gap:10px;">
      <button class="secondary-btn" style="width:auto;padding:10px 18px;" data-action="export-data">Export data</button>
      <button class="secondary-btn" style="width:auto;padding:10px 18px;" data-action="trigger-import">Import data</button>
    </div>
    <input type="file" id="import-file-input" accept="application/json" style="display:none;" aria-label="Choose a backup file to import">
  </div>`;
}
function renderInsightsHTML() {
  const today = todayISO();
  if (state.goals.length === 0) {
    return `<div class="header"><div><h1>Insights</h1><div class="subtitle">Your consistency, at a glance</div></div></div>
      <div class="screen"><div class="empty-state"><div class="emoji">📊</div><h3>Nothing to show yet</h3><p>Add a routine to see insights here.</p></div></div>
      ${dataBackupCardHTML()}
      ${bottomNavHTML('insights')}`;
  }
  const allStats = state.goals.map(g => ({ g, stats: computeStats(g) }));
  const totalCheckins = allStats.reduce((sum, x) => sum + x.stats.total, 0);
  const best = allStats.reduce((a, b) => (b.stats.longest > a.stats.longest ? b : a), allStats[0]);
  const week = last7Days(today);
  let scheduledCount = 0, doneCount = 0;
  allStats.forEach(({ g, stats }) => {
    if (g.frequency.type === 'times_per_week') {
      scheduledCount += stats.weeklyTarget;
      doneCount += Math.min(stats.thisWeekCount, stats.weeklyTarget);
      return;
    }
    week.forEach(d => {
      const t = targetForDay(g, d);
      if (t > 0) { scheduledCount++; if (completionsOn(g, d) >= t) doneCount++; }
    });
  });
  const pct = scheduledCount > 0 ? Math.round((doneCount / scheduledCount) * 100) : 0;
  const quote = QUOTES[dayOfWeek(today) % QUOTES.length];
  const byCat = {};
  state.goals.forEach(g => { byCat[g.category] = (byCat[g.category] || 0) + 1; });
  const catRows = Object.keys(byCat).map(id => `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;"><span>${catOf(id).emoji} ${catOf(id).name}</span><span style="color:var(--text-muted);">${byCat[id]}</span></div>`).join('');

  return `
    <div class="header"><div><h1>Insights</h1><div class="subtitle">Your consistency, at a glance</div></div></div>
    <div class="screen">
      <div class="stat-row">
        <div class="stat-box"><div class="num">${state.goals.length}</div><div class="lbl">Routines</div></div>
        <div class="stat-box"><div class="num">${best.stats.longest}</div><div class="lbl">Best streak</div></div>
        <div class="stat-box"><div class="num">${totalCheckins}</div><div class="lbl">Check-ins</div></div>
      </div>
      <div class="goal-card" style="display:block;">
        <div class="section-label" style="margin-bottom:6px;">This week</div>
        <div style="font-size:26px;font-weight:700;color:var(--primary-dark);">${pct}%</div>
        <div style="font-size:13px;color:var(--text-muted);">${doneCount} of ${scheduledCount} scheduled check-ins completed</div>
      </div>
      <div class="goal-card" style="display:block;">
        <div class="section-label" style="margin-bottom:2px;">By category</div>
        ${catRows}
      </div>
      <div class="goal-card" style="display:block;background:var(--primary-light);border:none;">
        <div style="font-size:13.5px;font-weight:600;color:var(--primary-dark);line-height:1.5;">"${quote}"</div>
      </div>
      ${dataBackupCardHTML()}
    </div>
    ${bottomNavHTML('insights')}
  `;
}

function resetForm() {
  form = { category: 'movement', name: '', freqType: 'daily', timesPerDay: 2, days: [], timesPerWeek: 3, tier: 'easy', trigger: '', mode: 'adaptive' };
}
function renderAddHTML() {
  const catGrid = CATEGORIES.map(c => `<div class="category-chip ${form.category === c.id ? 'selected' : ''}" data-action="select-category" data-id="${c.id}" role="button" tabindex="0" aria-pressed="${form.category === c.id}"><span class="emoji">${c.emoji}</span>${c.name}</div>`).join('');
  const freqTypes = [
    { id: 'daily', label: 'Every day' },
    { id: 'times_per_day', label: 'N times a day' },
    { id: 'weekdays', label: 'Specific days' },
    { id: 'times_per_week', label: 'N times a week' }
  ];
  const freqGrid = freqTypes.map(f => `<div class="freq-type-chip ${form.freqType === f.id ? 'selected' : ''}" data-action="select-freqtype" data-id="${f.id}" role="button" tabindex="0" aria-pressed="${form.freqType === f.id}">${f.label}</div>`).join('');
  let freqExtra = '';
  if (form.freqType === 'times_per_day') {
    freqExtra = `<div class="stepper-row"><button class="stepper-btn" data-action="step-tpd" data-delta="-1" aria-label="Decrease times per day">−</button><div class="stepper-value">${form.timesPerDay}x / day</div><button class="stepper-btn" data-action="step-tpd" data-delta="1" aria-label="Increase times per day">+</button></div>`;
  } else if (form.freqType === 'weekdays') {
    freqExtra = `<div class="day-toggle-row">${DAYS.map((d, i) => `<div class="day-toggle ${form.days.includes(i) ? 'selected' : ''}" data-action="toggle-day" data-day="${i}" role="button" tabindex="0" aria-pressed="${form.days.includes(i)}" aria-label="${DAY_FULL[i]}">${d}</div>`).join('')}</div>`;
  } else if (form.freqType === 'times_per_week') {
    freqExtra = `<div class="stepper-row"><button class="stepper-btn" data-action="step-tpw" data-delta="-1" aria-label="Decrease times per week">−</button><div class="stepper-value">${form.timesPerWeek}x / week</div><button class="stepper-btn" data-action="step-tpw" data-delta="1" aria-label="Increase times per week">+</button></div>`;
  }
  const tierGrid = TIERS.map(t => `<div class="tier-chip ${form.tier === t.id ? 'selected' : ''}" data-action="select-tier" data-id="${t.id}" role="button" tabindex="0" aria-pressed="${form.tier === t.id}">${t.name}<span class="pts-hint">${t.points} pt${t.points > 1 ? 's' : ''}</span></div>`).join('');
  const modeRow = `<div class="mode-toggle-row">
    <div class="mode-chip ${form.mode === 'adaptive' ? 'selected' : ''}" data-action="select-mode" data-id="adaptive" role="button" tabindex="0" aria-pressed="${form.mode === 'adaptive'}">
      <div class="mode-name">Adaptive</div><div class="mode-desc">Miss a day, use a streak freeze instead of losing everything.</div>
    </div>
    <div class="mode-chip ${form.mode === 'purist' ? 'selected' : ''}" data-action="select-mode" data-id="purist" role="button" tabindex="0" aria-pressed="${form.mode === 'purist'}">
      <div class="mode-name">Purist</div><div class="mode-desc">True to the original — any miss resets the streak.</div>
    </div>
  </div>`;

  return `
    ${headerWithBack('New routine')}
    <div class="screen">
      <div class="form-group"><label>Category</label><div class="category-grid">${catGrid}</div></div>
      <div class="form-group"><label>Name</label><input type="text" id="goal-name-input" placeholder="e.g. Morning run" value="${escapeHtml(form.name)}"></div>
      <div class="form-group"><label>Frequency</label><div class="freq-type-grid">${freqGrid}</div>${freqExtra}</div>
      <div class="form-group"><label>Difficulty</label><div class="tier-grid">${tierGrid}</div></div>
      <div class="form-group"><label>If you miss a day</label>${modeRow}</div>
      <div class="form-group"><label>Trigger (optional)</label><input type="text" id="goal-trigger-input" placeholder="e.g. Right after breakfast" value="${escapeHtml(form.trigger)}"></div>
      <button class="primary-btn" data-action="save-goal">Save routine · worth ${pointsPerCompletion({ tier: form.tier, frequency: freqObjFromForm() })} pts</button>
    </div>
  `;
}
function freqObjFromForm() {
  if (form.freqType === 'times_per_day') return { type: 'times_per_day', timesPerDay: form.timesPerDay };
  if (form.freqType === 'weekdays') return { type: 'weekdays', days: form.days };
  if (form.freqType === 'times_per_week') return { type: 'times_per_week', timesPerWeek: form.timesPerWeek };
  return { type: 'daily' };
}

function renderTemplatesHTML() {
  const cards = TEMPLATES.map(t => `<div class="template-card">
    <h3>${t.name}</h3><p>${t.description}</p>
    <button class="secondary-btn" data-action="preview-template" data-id="${t.id}">View & start ${ICONS.chevronRight}</button>
  </div>`).join('');
  return `${headerWithBack('Templates')}<div class="screen">${cards}</div>${bottomNavHTML('home')}`;
}
function renderTemplatePreviewHTML(templateId) {
  const t = TEMPLATES.find(x => x.id === templateId);
  if (!form.templateSelected) form.templateSelected = t.activities.map(() => true);
  if (t.supportsMode && !form.templateMode) form.templateMode = 'adaptive';
  const rows = t.activities.map((a, i) => `<div class="template-activity-row">
    <div class="checkbox-toggle ${form.templateSelected[i] ? 'checked' : ''}" data-action="toggle-template-activity" data-idx="${i}" role="checkbox" tabindex="0" aria-checked="${form.templateSelected[i]}" aria-label="${escapeHtml(a.name)}">${form.templateSelected[i] ? ICONS.check : ''}</div>
    <div class="ta-name">${catOf(a.category).emoji} ${a.name}<div class="ta-meta">${a.frequency.type === 'times_per_day' ? a.frequency.timesPerDay + 'x/day' : a.frequency.type === 'times_per_week' ? a.frequency.timesPerWeek + 'x/week' : 'Daily'} · ${tierOf(a.tier).points} pts</div></div>
  </div>`).join('');
  const modeRow = t.supportsMode ? `<div class="form-group"><label>Mode</label><div class="mode-toggle-row">
    <div class="mode-chip ${form.templateMode === 'adaptive' ? 'selected' : ''}" data-action="select-template-mode" data-id="adaptive" role="button" tabindex="0" aria-pressed="${form.templateMode === 'adaptive'}"><div class="mode-name">Adaptive</div><div class="mode-desc">Streak freezes instead of a hard reset.</div></div>
    <div class="mode-chip ${form.templateMode === 'purist' ? 'selected' : ''}" data-action="select-template-mode" data-id="purist" role="button" tabindex="0" aria-pressed="${form.templateMode === 'purist'}"><div class="mode-name">Purist</div><div class="mode-desc">Original rules — any miss resets.</div></div>
  </div></div>` : '';
  const count = form.templateSelected.filter(Boolean).length;
  return `${headerWithBack(t.name)}<div class="screen">
    <p style="font-size:13px;color:var(--text-muted);margin-top:0;">${t.description}</p>
    <div class="template-card">${rows}</div>
    ${modeRow}
    <button class="primary-btn" data-action="start-template" data-id="${t.id}" ${count === 0 ? 'disabled' : ''}>Add ${count} routine${count === 1 ? '' : 's'}</button>
  </div>${bottomNavHTML('home')}`;
}

function renderDetailHTML(goalId) {
  const g = state.goals.find(x => x.id === goalId);
  const stats = computeStats(g);
  const today = todayISO();
  const isWeekly = g.frequency.type === 'times_per_week';
  let heatSection = '';
  if (!isWeekly) {
    const cells = heatDays(today, 84).map(d => {
      let cls;
      if (d < g.createdAt) cls = 'future';
      else if (g.freezesApplied && g.freezesApplied[d]) cls = 'frozen';
      else {
        const t = targetForDay(g, d);
        if (t === 0) cls = 'rest-day';
        else if (completionsOn(g, d) >= t) cls = 'on';
        else if (d === today) cls = '';
        else cls = 'miss';
      }
      return `<div class="heat-cell ${cls}"></div>`;
    }).join('');
    heatSection = `<div class="section-label">Last 12 weeks</div><div class="heatmap-grid">${cells}</div>`;
  } else {
    heatSection = `<div class="goal-card" style="display:block;"><div class="section-label" style="margin-bottom:6px;">This week</div><div style="font-size:26px;font-weight:700;color:var(--primary-dark);">${stats.thisWeekCount} / ${stats.weeklyTarget}</div></div>`;
  }
  const modeNote = g.mode === 'purist' ? 'Purist mode — any miss resets this streak.' : 'Adaptive mode — streak freezes protect a missed day.';
  const retroFreeze = canRetroFreezeYesterday(g) && state.garden.freezeInventory > 0
    ? `<div class="goal-card" style="display:block;">
        Changed your mind? You can still protect yesterday.
        <button class="secondary-btn" style="width:auto;padding:8px 16px;margin-top:8px;" data-action="use-freeze" data-id="${g.id}" data-date="${addDays(todayISO(), -1)}">Use a freeze for yesterday</button>
      </div>`
    : '';
  const deleteRow = view.confirmDelete === g.id
    ? `<div style="display:flex;gap:10px;justify-content:center;margin-top:24px;">
        <button class="secondary-btn" style="width:auto;padding:10px 18px;" data-action="cancel-delete">Cancel</button>
        <button class="primary-btn" style="width:auto;padding:10px 18px;margin-top:0;background:var(--accent-dark);" data-action="confirm-delete-goal" data-id="${g.id}">Yes, delete</button>
      </div>`
    : `<button class="delete-link" data-action="delete-goal" data-id="${g.id}">Delete this routine</button>`;
  return `${headerWithBack(catOf(g.category).emoji + ' ' + escapeHtml(g.name))}
    <div class="screen">
      <div class="stat-row">
        <div class="stat-box"><div class="num">${stats.current}</div><div class="lbl">Current</div></div>
        <div class="stat-box"><div class="num">${stats.longest}</div><div class="lbl">Longest</div></div>
        <div class="stat-box"><div class="num">${stats.total}</div><div class="lbl">Total</div></div>
      </div>
      <div style="font-size:13px;color:var(--text-muted);margin:-10px 0 20px;">${freqLabel(g)} · ${pointsPerCompletion(g)} pts each${g.trigger ? ' · ' + escapeHtml(g.trigger) : ''}<br>${modeNote}</div>
      ${retroFreeze}
      ${heatSection}
      ${deleteRow}
    </div>
  `;
}

function render() {
  const app = document.getElementById('app');
  let html;
  switch (view.name) {
    case 'add': html = renderAddHTML(); break;
    case 'garden': html = renderGardenHTML(); break;
    case 'insights': html = renderInsightsHTML(); break;
    case 'templates': html = renderTemplatesHTML(); break;
    case 'templatePreview': html = renderTemplatePreviewHTML(view.templateId); break;
    case 'detail':
      if (!state.goals.find(g => g.id === view.goalId)) { view = { name: 'home' }; html = renderHomeHTML(); }
      else html = renderDetailHTML(view.goalId);
      break;
    default: html = renderHomeHTML();
  }
  app.innerHTML = html;
}

function showToast(msg) {
  const app = document.getElementById('app');
  const existing = app.querySelector('.toast');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'toast';
  div.setAttribute('role', 'status');
  div.setAttribute('aria-live', 'polite');
  div.textContent = msg;
  app.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 2300);
}
function showUndoToast(msg, onUndo) {
  const app = document.getElementById('app');
  const existing = app.querySelector('.toast');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'toast toast-undo';
  div.setAttribute('role', 'status');
  div.setAttribute('aria-live', 'polite');
  const span = document.createElement('span');
  span.textContent = msg;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'toast-undo-btn';
  btn.textContent = 'Undo';
  btn.addEventListener('click', () => {
    if (div.parentNode) div.parentNode.removeChild(div);
    onUndo();
  });
  div.appendChild(span);
  div.appendChild(btn);
  app.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 5000);
}
function popPlant() {
  const el = document.getElementById('plant-avatar');
  if (el) { el.classList.remove('leaf-pop'); void el.offsetWidth; el.classList.add('leaf-pop'); }
}

/* ---------- actions ---------- */
function applyCheckinDelta(goal, dateStr, nextCount) {
  const cur = completionsOn(goal, dateStr);
  const delta = nextCount - cur;
  if (nextCount <= 0) delete goal.checkins[dateStr]; else goal.checkins[dateStr] = nextCount;
  addPoints(delta * pointsPerCompletion(goal));
  return delta;
}
function doToggleCheckin(goal) {
  const today = todayISO();
  const isWeekly = goal.frequency.type === 'times_per_week';
  const target = isWeekly ? 1 : targetForDay(goal, today);
  const cur = completionsOn(goal, today);
  let next = cur + 1;
  if (cur >= target) next = 0;
  const delta = applyCheckinDelta(goal, today, next);
  saveState();
  if (delta > 0) {
    const stats = computeStats(goal);
    if ([3, 7, 14, 30, 60, 100].includes(stats.current)) showToast(`${stats.current}-day streak on ${goal.name}!`);
    else showToast(`+${delta * pointsPerCompletion(goal)} pts · ${goal.name}`);
  }
}

const handlers = {
  'go-home': () => { navStack = []; view = { name: 'home' }; render(); },
  'go-garden': () => { navStack = []; view = { name: 'garden' }; render(); },
  'go-insights': () => { navStack = []; view = { name: 'insights' }; render(); },
  'go-back': () => { view = navStack.pop() || { name: 'home' }; render(); },
  'go-templates': () => { navStack.push(view); view = { name: 'templates' }; render(); },
  'go-add': () => { navStack.push(view); resetForm(); view = { name: 'add' }; render(); },
  'go-detail': (el) => { navStack.push(view); view = { name: 'detail', goalId: el.dataset.id }; render(); },
  'preview-template': (el) => { navStack.push(view); form = form || {}; form.templateSelected = null; form.templateMode = null; view = { name: 'templatePreview', templateId: el.dataset.id }; render(); },
  'toggle-checkin': (el) => {
    const g = state.goals.find(x => x.id === el.dataset.id);
    if (!g) return;
    doToggleCheckin(g);
    render();
    popPlant();
  },
  'complete-all': () => {
    const today = todayISO();
    let totalDelta = 0;
    state.goals.forEach(g => {
      const isWeekly = g.frequency.type === 'times_per_week';
      const target = isWeekly ? 1 : targetForDay(g, today);
      if (target === 0) return;
      const cur = completionsOn(g, today);
      if (cur < target) totalDelta += applyCheckinDelta(g, today, target) * pointsPerCompletion(g);
    });
    saveState();
    render();
    popPlant();
    if (totalDelta > 0) showToast(`+${totalDelta} pts · all done for today`);
  },
  'use-freeze': (el) => {
    const g = state.goals.find(x => x.id === el.dataset.id);
    if (!g || state.garden.freezeInventory <= 0) return;
    g.freezesApplied = g.freezesApplied || {};
    g.freezesApplied[el.dataset.date] = true;
    state.garden.freezeInventory--;
    saveState();
    render();
    showToast('Freeze used — streak protected');
  },
  'dismiss-freeze': (el) => {
    const g = state.goals.find(x => x.id === el.dataset.id);
    if (!g) return;
    g.freezeDismissed = g.freezeDismissed || {};
    g.freezeDismissed[el.dataset.date] = true;
    saveState();
    render();
  },
  'select-category': (el) => { form.category = el.dataset.id; render(); },
  'select-freqtype': (el) => { form.freqType = el.dataset.id; render(); },
  'step-tpd': (el) => { form.timesPerDay = Math.max(2, Math.min(6, form.timesPerDay + parseInt(el.dataset.delta, 10))); render(); },
  'step-tpw': (el) => { form.timesPerWeek = Math.max(1, Math.min(6, form.timesPerWeek + parseInt(el.dataset.delta, 10))); render(); },
  'toggle-day': (el) => {
    const day = parseInt(el.dataset.day, 10);
    const idx = form.days.indexOf(day);
    if (idx >= 0) form.days.splice(idx, 1); else form.days.push(day);
    render();
  },
  'select-tier': (el) => { form.tier = el.dataset.id; render(); },
  'select-mode': (el) => { form.mode = el.dataset.id; render(); },
  'select-template-mode': (el) => { form.templateMode = el.dataset.id; render(); },
  'toggle-template-activity': (el) => {
    const idx = parseInt(el.dataset.idx, 10);
    form.templateSelected[idx] = !form.templateSelected[idx];
    render();
  },
  'start-template': (el) => {
    const t = TEMPLATES.find(x => x.id === el.dataset.id);
    const today = todayISO();
    let added = 0;
    t.activities.forEach((a, i) => {
      if (!form.templateSelected[i]) return;
      state.goals.push({
        id: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + i,
        name: a.name,
        category: a.category,
        frequency: a.frequency,
        tier: a.tier,
        trigger: '',
        mode: t.supportsMode ? form.templateMode : 'adaptive',
        createdAt: today,
        checkins: {},
        freezesApplied: {},
        freezeDismissed: {}
      });
      added++;
    });
    saveState();
    navStack = [];
    view = { name: 'home' };
    render();
    showToast(`${added} routine${added === 1 ? '' : 's'} added from ${t.name}`);
  },
  'save-goal': () => {
    const name = (form.name || '').trim();
    if (!name) { showToast('Give your routine a name'); return; }
    const frequency = freqObjFromForm();
    if (frequency.type === 'weekdays' && frequency.days.length === 0) { showToast('Pick at least one day'); return; }
    const goal = {
      id: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      category: form.category,
      frequency,
      tier: form.tier,
      trigger: (form.trigger || '').trim(),
      mode: form.mode,
      createdAt: todayISO(),
      checkins: {},
      freezesApplied: {},
      freezeDismissed: {}
    };
    state.goals.push(goal);
    saveState();
    navStack = [];
    view = { name: 'home' };
    render();
    showToast(`${catOf(goal.category).emoji} ${goal.name} added`);
  },
  'delete-goal': (el) => { view.confirmDelete = el.dataset.id; render(); },
  'cancel-delete': () => { view.confirmDelete = null; render(); },
  'confirm-delete-goal': (el) => {
    const idx = state.goals.findIndex(g => g.id === el.dataset.id);
    if (idx === -1) return;
    const [removed] = state.goals.splice(idx, 1);
    saveState();
    navStack = [];
    view = { name: 'home' };
    render();
    showUndoToast(`${removed.name} deleted`, () => {
      state.goals.splice(Math.min(idx, state.goals.length), 0, removed);
      saveState();
      render();
    });
  },
  'export-data': () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprout-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded');
  },
  'trigger-import': () => {
    const input = document.getElementById('import-file-input');
    if (input) input.click();
  },
  'cancel-import': () => { pendingImport = null; render(); },
  'confirm-import': () => {
    if (!pendingImport) return;
    state = pendingImport;
    pendingImport = null;
    saveState();
    navStack = [];
    view = { name: 'insights' };
    render();
    showToast('Data imported');
  },
  'shop-buy': (el) => {
    const item = SHOP_ITEMS.find(i => i.id === el.dataset.id);
    const g = state.garden;
    if (item.type === 'freeze') {
      if (g.balance < item.cost) return;
      g.balance -= item.cost;
      g.freezeInventory++;
      saveState(); render();
      showToast('Freeze purchased');
      return;
    }
    const owned = itemOwned(item.id);
    if (!owned) {
      if (g.balance < item.cost) return;
      g.balance -= item.cost;
      g.unlocked.push(item.id);
    }
    g.equipped[item.type] = item.id;
    saveState(); render();
    showToast(owned ? item.name + ' equipped' : item.name + ' purchased and equipped');
  }
};

/* ---------- swipe-to-complete ---------- */
let swipeState = null;
function onTouchStart(e) {
  const card = e.target.closest('[data-goal-swipe]');
  if (!card) return;
  if (e.target.closest('[data-action]')) return;
  swipeState = { card, startX: e.touches[0].clientX, id: card.dataset.goalSwipe };
}
function onTouchMove(e) {
  if (!swipeState) return;
  const dx = e.touches[0].clientX - swipeState.startX;
  if (dx > 10) {
    const inner = swipeState.card.querySelector('.goal-card-inner');
    inner.style.transform = `translateX(${Math.min(dx, 70)}px)`;
  }
}
function onTouchEnd(e) {
  if (!swipeState) return;
  const dx = (e.changedTouches[0].clientX - swipeState.startX);
  const inner = swipeState.card.querySelector('.goal-card-inner');
  inner.style.transform = '';
  if (dx > 60) {
    const g = state.goals.find(x => x.id === swipeState.id);
    if (g) {
      const today = todayISO();
      const isWeekly = g.frequency.type === 'times_per_week';
      const target = isWeekly ? 1 : targetForDay(g, today);
      if (completionsOn(g, today) < target) { doToggleCheckin(g); render(); popPlant(); }
    }
  }
  swipeState = null;
}

function onAppClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t || t.hasAttribute('disabled')) return;
  const action = t.dataset.action;
  if (handlers[action]) handlers[action](t, e);
}
function onAppKeydown(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const t = e.target.closest('[data-action][role="button"], [data-action][role="checkbox"]');
  if (!t || t.hasAttribute('disabled')) return;
  e.preventDefault();
  const action = t.dataset.action;
  if (handlers[action]) handlers[action](t, e);
}
function onAppInput(e) {
  if (!form) return;
  if (e.target.id === 'goal-name-input') form.name = e.target.value;
  else if (e.target.id === 'goal-trigger-input') form.trigger = e.target.value;
}
function onAppChange(e) {
  if (e.target.id !== 'import-file-input' || !e.target.files || !e.target.files[0]) return;
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    let normalized = null;
    try { normalized = normalizeState(JSON.parse(reader.result)); } catch (err) { /* invalid JSON */ }
    if (!normalized) { showToast('That file is not a valid Sprout backup'); return; }
    pendingImport = normalized;
    render();
  };
  reader.readAsText(file);
  e.target.value = '';
}

document.addEventListener('DOMContentLoaded', function () {
  state = loadState();
  resetForm();
  const app = document.getElementById('app');
  app.addEventListener('click', onAppClick);
  app.addEventListener('keydown', onAppKeydown);
  app.addEventListener('input', onAppInput);
  app.addEventListener('change', onAppChange);
  app.addEventListener('touchstart', onTouchStart, { passive: true });
  app.addEventListener('touchmove', onTouchMove, { passive: true });
  app.addEventListener('touchend', onTouchEnd);
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) { state = loadState(); render(); }
  });
  render();
});
