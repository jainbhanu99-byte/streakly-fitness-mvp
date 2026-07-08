/* Streakly — fitness consistency MVP
   Vanilla JS, localStorage-backed, no build step. */

const STORAGE_KEY = 'streakly_data_v1';

const TEMPLATES = [
  { emoji: '💪', name: 'Workout' },
  { emoji: '🏃', name: 'Run' },
  { emoji: '🧘', name: 'Yoga' },
  { emoji: '🚶', name: 'Walk' },
  { emoji: '🚴', name: 'Cycle' },
  { emoji: '🏊', name: 'Swim' },
  { emoji: '🏋️', name: 'Gym' },
  { emoji: '🤸', name: 'Stretch' },
  { emoji: '✏️', name: 'Custom' }
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MILESTONES = [
  { n: 3, emoji: '🔥', label: '3 Days' },
  { n: 7, emoji: '⚡', label: '7 Days' },
  { n: 14, emoji: '🌟', label: '14 Days' },
  { n: 30, emoji: '🏅', label: '30 Days' },
  { n: 60, emoji: '🏆', label: '60 Days' },
  { n: 100, emoji: '👑', label: '100 Days' }
];

const QUOTES = [
  "Small consistent actions beat big sporadic ones.",
  "You don't need motivation, you need a trigger.",
  "Every check-in is a vote for the person you're becoming.",
  "Don't break the chain.",
  "Progress, not perfection.",
  "Consistency compounds — trust the process.",
  "Show up small, show up daily."
];

let state = { goals: [] };
let view = { name: 'home', goalId: null };
let addForm = { templateIdx: null, name: '', emoji: '💪', frequency: 'daily', days: [], trigger: '' };

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
function last7Days(today) { return heatDays(today, 7); }
function formatFriendly(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- persistence ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore corrupt data */ }
  return { goals: [] };
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------- goal logic ---------- */
function isScheduled(goal, dateStr) {
  if (dateStr < goal.createdAt) return false;
  if (goal.frequency === 'daily') return true;
  return goal.days.includes(dayOfWeek(dateStr));
}
function isChecked(goal, dateStr) {
  return !!goal.checkins[dateStr];
}
// Single forward pass: current streak (with a grace day for "today"), longest streak, total check-ins.
function computeStats(goal) {
  const end = todayISO();
  let d = goal.createdAt;
  let run = 0, longest = 0, total = 0;
  while (true) {
    if (isScheduled(goal, d)) {
      if (isChecked(goal, d)) {
        run++; total++;
        if (run > longest) longest = run;
      } else if (d !== end) {
        run = 0;
      }
      // if d === end and not checked: grace period, leave run untouched
    }
    if (d === end) break;
    d = addDays(d, 1);
  }
  if (run > longest) longest = run;
  return { current: run, longest, total };
}
function resetAddForm() {
  addForm = { templateIdx: null, name: '', emoji: '💪', frequency: 'daily', days: [], trigger: '' };
}

/* ---------- rendering ---------- */
function headerWithBack(title) {
  return `<div class="header">
    <button class="header-icon-btn" data-action="go-home">←</button>
    <h1 style="font-size:18px;">${title}</h1>
    <div style="width:40px;"></div>
  </div>`;
}
function bottomNavHTML(active) {
  return `<div class="bottom-nav">
    <button class="nav-btn ${active === 'home' ? 'active' : ''}" data-action="go-home"><span class="icon">🏠</span>Home</button>
    <button class="nav-btn ${active === 'insights' ? 'active' : ''}" data-action="go-insights"><span class="icon">📊</span>Insights</button>
  </div>`;
}

function goalCardHTML(g, today) {
  const stats = computeStats(g);
  const scheduled = isScheduled(g, today);
  const checked = isChecked(g, today);
  const circleClass = !scheduled ? 'rest' : (checked ? 'done' : '');
  const circleContent = !scheduled ? '💤' : (checked ? '✓' : '');
  const circleAction = scheduled ? `data-action="toggle-checkin" data-id="${g.id}"` : '';
  const freqLabel = g.frequency === 'daily' ? 'Daily' : g.days.slice().sort().map(d => DAYS[d]).join(' ');
  const miniHeat = last7Days(today).map(d => {
    let cls = '';
    if (d >= g.createdAt) {
      if (!isScheduled(g, d)) cls = 'rest-day';
      else if (isChecked(g, d)) cls = 'on';
      else if (d < today) cls = 'miss';
    }
    return `<span class="${cls}"></span>`;
  }).join('');
  return `<div class="goal-card">
    <div class="check-circle ${circleClass}" ${circleAction}>${circleContent}</div>
    <div class="goal-card-info" data-action="go-detail" data-id="${g.id}">
      <div class="goal-name">${g.emoji} ${escapeHtml(g.name)}</div>
      <div class="goal-meta"><span class="streak-pill">🔥 ${stats.current}</span><span>${freqLabel}</span></div>
      <div class="mini-heat">${miniHeat}</div>
    </div>
    <div class="chevron" data-action="go-detail" data-id="${g.id}">›</div>
  </div>`;
}

function renderHomeHTML() {
  const today = todayISO();
  let goalsHtml;
  if (state.goals.length === 0) {
    goalsHtml = `<div class="empty-state">
      <div class="emoji">🏋️‍♀️</div>
      <h3>No fitness goals yet</h3>
      <p>Add one to start building a streak today.</p>
      <button class="primary-btn" data-action="go-add" style="width:auto;padding:14px 28px;">+ Add a Goal</button>
    </div>`;
  } else {
    goalsHtml = state.goals.map(g => goalCardHTML(g, today)).join('');
  }
  return `
    <div class="header"><div><h1>Streakly</h1><div class="subtitle">${formatFriendly(today)}</div></div></div>
    <div class="screen">${goalsHtml}</div>
    <button class="fab" data-action="go-add">+</button>
    ${bottomNavHTML('home')}
  `;
}

function renderInsightsHTML() {
  const today = todayISO();
  if (state.goals.length === 0) {
    return `
      <div class="header"><div><h1>Insights</h1><div class="subtitle">Your consistency, at a glance</div></div></div>
      <div class="screen"><div class="empty-state">
        <div class="emoji">📊</div>
        <h3>Nothing to show yet</h3>
        <p>Add a fitness goal to see your consistency insights here.</p>
      </div></div>
      ${bottomNavHTML('insights')}
    `;
  }
  const allStats = state.goals.map(g => ({ g, stats: computeStats(g) }));
  const totalCheckins = allStats.reduce((sum, x) => sum + x.stats.total, 0);
  const best = allStats.reduce((a, b) => (b.stats.current > a.stats.current ? b : a), allStats[0]);
  const week = last7Days(today);
  let scheduledCount = 0, doneCount = 0;
  state.goals.forEach(g => {
    week.forEach(d => {
      if (isScheduled(g, d)) { scheduledCount++; if (isChecked(g, d)) doneCount++; }
    });
  });
  const pct = scheduledCount > 0 ? Math.round((doneCount / scheduledCount) * 100) : 0;
  const quote = QUOTES[dayOfWeek(today) % QUOTES.length];

  return `
    <div class="header"><div><h1>Insights</h1><div class="subtitle">Your consistency, at a glance</div></div></div>
    <div class="screen">
      <div class="stat-row">
        <div class="stat-box"><div class="num">${state.goals.length}</div><div class="lbl">Active Goals</div></div>
        <div class="stat-box"><div class="num">${best.stats.current}</div><div class="lbl">Best Streak</div></div>
        <div class="stat-box"><div class="num">${totalCheckins}</div><div class="lbl">Check-ins</div></div>
      </div>
      <div class="goal-card" style="display:block;">
        <div class="section-title" style="margin-bottom:6px;">This Week</div>
        <div style="font-size:28px;font-weight:800;color:var(--primary);">${pct}%</div>
        <div style="font-size:13px;color:var(--text-muted);">${doneCount} of ${scheduledCount} scheduled check-ins completed</div>
      </div>
      <div class="goal-card" style="display:block;background:var(--primary-light);">
        <div style="font-size:14px;font-weight:600;color:var(--primary-dark);line-height:1.5;">"${quote}"</div>
      </div>
    </div>
    ${bottomNavHTML('insights')}
  `;
}

function renderAddHTML() {
  const templateGrid = TEMPLATES.map((t, i) => `
    <div class="template-chip ${addForm.templateIdx === i ? 'selected' : ''}" data-action="select-template" data-idx="${i}">
      <span class="emoji">${t.emoji}</span>${t.name}
    </div>`).join('');
  const dayToggles = DAYS.map((d, i) => `<div class="day-toggle ${addForm.days.includes(i) ? 'selected' : ''}" data-action="toggle-day" data-day="${i}">${d}</div>`).join('');

  return `
    ${headerWithBack('New Fitness Goal')}
    <div class="screen">
      <div class="form-group">
        <label>Choose a template</label>
        <div class="template-grid">${templateGrid}</div>
      </div>
      <div class="form-group">
        <label>Goal name</label>
        <input type="text" id="goal-name-input" placeholder="e.g. Morning Run" value="${escapeHtml(addForm.name)}">
      </div>
      <div class="form-group">
        <label>Frequency</label>
        <div class="freq-row">
          <div class="freq-option ${addForm.frequency === 'daily' ? 'selected' : ''}" data-action="select-freq" data-freq="daily">Every Day</div>
          <div class="freq-option ${addForm.frequency === 'custom' ? 'selected' : ''}" data-action="select-freq" data-freq="custom">Specific Days</div>
        </div>
        ${addForm.frequency === 'custom' ? `<div class="day-toggle-row" style="margin-top:10px;">${dayToggles}</div>` : ''}
      </div>
      <div class="form-group">
        <label>Trigger (optional)</label>
        <input type="text" id="goal-trigger-input" placeholder="e.g. Right after breakfast" value="${escapeHtml(addForm.trigger)}">
      </div>
      <button class="primary-btn" data-action="save-goal">Save Goal</button>
    </div>
  `;
}

function renderDetailHTML(goalId) {
  const g = state.goals.find(x => x.id === goalId);
  const stats = computeStats(g);
  const today = todayISO();
  const cells = heatDays(today, 84).map(d => {
    let cls;
    if (d < g.createdAt) cls = 'future';
    else if (!isScheduled(g, d)) cls = 'rest-day';
    else if (isChecked(g, d)) cls = 'on';
    else if (d === today) cls = '';
    else cls = 'miss';
    return `<div class="heat-cell ${cls}"></div>`;
  }).join('');
  const badges = MILESTONES.map(m => `
    <div class="badge ${stats.longest >= m.n ? 'unlocked' : ''}">
      <span class="emoji">${m.emoji}</span>
      <div class="lbl">${m.label}</div>
    </div>`).join('');
  const freqLabel = g.frequency === 'daily' ? 'Every day' : 'On ' + g.days.slice().sort().map(d => DAY_FULL[d]).join(', ');

  return `
    ${headerWithBack(g.emoji + ' ' + escapeHtml(g.name))}
    <div class="screen">
      <div class="stat-row">
        <div class="stat-box"><div class="num">${stats.current}</div><div class="lbl">Current</div></div>
        <div class="stat-box"><div class="num">${stats.longest}</div><div class="lbl">Longest</div></div>
        <div class="stat-box"><div class="num">${stats.total}</div><div class="lbl">Total</div></div>
      </div>
      <div style="font-size:13px;color:var(--text-muted);margin:-10px 0 20px;">${freqLabel}${g.trigger ? ' · ' + escapeHtml(g.trigger) : ''}</div>
      <div class="section-title">Last 12 Weeks</div>
      <div class="heatmap-grid">${cells}</div>
      <div class="section-title">Badges</div>
      <div class="badge-grid">${badges}</div>
      <button class="delete-link" data-action="delete-goal" data-id="${g.id}">Delete this goal</button>
    </div>
  `;
}

function render() {
  const app = document.getElementById('app');
  let html;
  switch (view.name) {
    case 'add':
      html = renderAddHTML();
      break;
    case 'insights':
      html = renderInsightsHTML();
      break;
    case 'detail':
      if (!state.goals.find(g => g.id === view.goalId)) {
        view = { name: 'home' };
        html = renderHomeHTML();
      } else {
        html = renderDetailHTML(view.goalId);
      }
      break;
    default:
      html = renderHomeHTML();
  }
  app.innerHTML = html;
}

function showToast(msg) {
  const app = document.getElementById('app');
  const existing = app.querySelector('.toast');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  app.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 2200);
}

/* ---------- actions ---------- */
const handlers = {
  'go-home': () => { view = { name: 'home' }; render(); },
  'go-insights': () => { view = { name: 'insights' }; render(); },
  'go-add': () => { resetAddForm(); view = { name: 'add' }; render(); },
  'go-detail': (el) => { view = { name: 'detail', goalId: el.dataset.id }; render(); },
  'toggle-checkin': (el) => {
    const g = state.goals.find(x => x.id === el.dataset.id);
    if (!g) return;
    const today = todayISO();
    if (g.checkins[today]) delete g.checkins[today];
    else g.checkins[today] = true;
    saveState();
    const justChecked = !!g.checkins[today];
    render();
    if (justChecked) {
      const stats = computeStats(g);
      if (MILESTONES.some(m => m.n === stats.current)) {
        showToast(`🎉 ${stats.current}-day streak on ${g.name}!`);
      } else {
        showToast(`Nice! ${g.name} checked in.`);
      }
    }
  },
  'select-template': (el) => {
    const idx = parseInt(el.dataset.idx, 10);
    addForm.templateIdx = idx;
    const t = TEMPLATES[idx];
    if (t.name === 'Custom') { addForm.name = ''; addForm.emoji = '✏️'; }
    else { addForm.name = t.name; addForm.emoji = t.emoji; }
    render();
  },
  'select-freq': (el) => { addForm.frequency = el.dataset.freq; render(); },
  'toggle-day': (el) => {
    const day = parseInt(el.dataset.day, 10);
    const idx = addForm.days.indexOf(day);
    if (idx >= 0) addForm.days.splice(idx, 1); else addForm.days.push(day);
    render();
  },
  'save-goal': () => {
    const name = (addForm.name || '').trim();
    if (!name) { showToast('Give your goal a name'); return; }
    if (addForm.frequency === 'custom' && addForm.days.length === 0) { showToast('Pick at least one day'); return; }
    const goal = {
      id: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      emoji: addForm.emoji || '💪',
      frequency: addForm.frequency,
      days: addForm.frequency === 'custom' ? addForm.days.slice() : [],
      trigger: (addForm.trigger || '').trim(),
      createdAt: todayISO(),
      checkins: {}
    };
    state.goals.push(goal);
    saveState();
    view = { name: 'home' };
    render();
    showToast(`${goal.emoji} ${goal.name} added — let's build that streak!`);
  },
  'delete-goal': (el) => {
    if (!confirm('Delete this goal? This cannot be undone.')) return;
    state.goals = state.goals.filter(g => g.id !== el.dataset.id);
    saveState();
    view = { name: 'home' };
    render();
  }
};

function onAppClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;
  if (handlers[action]) handlers[action](t, e);
}
function onAppInput(e) {
  if (e.target.id === 'goal-name-input') addForm.name = e.target.value;
  else if (e.target.id === 'goal-trigger-input') addForm.trigger = e.target.value;
}

document.addEventListener('DOMContentLoaded', function () {
  state = loadState();
  resetAddForm();
  const app = document.getElementById('app');
  app.addEventListener('click', onAppClick);
  app.addEventListener('input', onAppInput);
  render();
});
