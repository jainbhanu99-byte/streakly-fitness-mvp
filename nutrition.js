/* Nutrition hub, profile setup, and meal plan builder.
   Uses FOOD_DB/RECIPE_DB/calcTargets etc. from nutrition-data.js. */
let profileForm = null;
let mealPlanDraft = { items: [] };
let mealSearchQuery = '';
let mealFilterTag = null;
let mealPlanName = '';

function resetProfileForm() {
  const p = state.profile;
  profileForm = p ? { ...p } : { age: 25, sex: 'male', weightKg: 70, heightCm: 170, activityLevel: 'moderate', goal: 'maintain' };
}

function nutritionSubgoals() {
  const profile = state.profile;
  const targets = profile ? calcTargets(profile) : null;
  const waterL = targets ? targets.waterLiters : 2.5;
  return [
    {
      id: 'protein',
      emoji: '🍗',
      title: 'Protein target',
      description: targets ? `Based on your profile: ${targets.protein}g/day for your goal.` : 'Set up your profile to get a personalized daily protein target.',
      template: targets ? { name: `Hit ${targets.protein}g protein`, frequency: { type: 'daily' }, tier: 'moderate', mode: 'adaptive' } : null
    },
    {
      id: 'hydration',
      emoji: '💧',
      title: 'Hydration',
      description: targets ? `Recommended for your weight: ~${waterL}L/day.` : 'A general guideline of ~2.5L/day — set up your profile for a number based on your weight.',
      template: { name: `Drink ${waterL}L of water`, frequency: { type: 'daily' }, tier: 'easy', mode: 'adaptive' }
    },
    {
      id: 'meal_timing',
      emoji: '🍽️',
      title: 'Consistent meals',
      description: 'Eat on a regular schedule — 3 meals a day, tracked as a simple check-in.',
      template: { name: 'Eat 3 meals today', frequency: { type: 'times_per_day', timesPerDay: 3 }, tier: 'micro', mode: 'adaptive' }
    }
  ];
}

function renderNutritionHubHTML() {
  const profile = state.profile;
  const cards = nutritionSubgoals().map(sg => `<div class="subgoal-card">
    <div class="subgoal-emoji">${sg.emoji}</div>
    <div class="subgoal-info">
      <div class="subgoal-title">${sg.title}</div>
      <div class="subgoal-desc">${sg.description}</div>
    </div>
    <button class="secondary-btn" style="width:auto;padding:8px 16px;flex-shrink:0;" data-action="${sg.template ? 'quick-add-nutrition' : 'go-nutrition-profile'}" data-id="${sg.id}">${sg.template ? 'Add' : 'Set up'}</button>
  </div>`).join('');

  const profileSummary = profile ? `<div class="goal-card" style="display:block;">
      <div class="section-label" style="margin-bottom:6px;">Your numbers</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <div class="plant-stat" style="flex:1;min-width:80px;"><div class="num">${calcTargets(profile).calories}</div><div class="lbl">kcal/day</div></div>
        <div class="plant-stat" style="flex:1;min-width:80px;"><div class="num">${calcTargets(profile).protein}g</div><div class="lbl">protein/day</div></div>
        <div class="plant-stat" style="flex:1;min-width:80px;"><div class="num">${calcTargets(profile).waterLiters}L</div><div class="lbl">water/day</div></div>
      </div>
      <p style="font-size:11.5px;color:var(--text-muted);margin:10px 0 0;">Estimated from standard formulas (Mifflin-St Jeor + activity level) — for planning only, not medical advice.</p>
      <button class="link-btn" style="margin-top:6px;" data-action="go-nutrition-profile">Edit profile</button>
    </div>` : `<div class="goal-card" style="display:block;">
      <div class="section-label" style="margin-bottom:6px;">Get personalized targets</div>
      <p style="font-size:13px;color:var(--text-muted);margin:0 0 10px;">Answer 5 quick questions to get a calorie and protein target based on your body and goal.</p>
      <button class="primary-btn" style="width:auto;padding:10px 18px;" data-action="go-nutrition-profile">Set up nutrition profile</button>
    </div>`;

  return `${headerWithBack('Nutrition')}
    <div class="screen">
      ${profileSummary}
      <div class="section-label" style="margin-top:16px;">Quick goals</div>
      ${cards}
      <button class="secondary-btn" style="margin-top:6px;" data-action="go-meal-plan-builder">🍱 Build a meal plan</button>
      <button class="link-btn" style="margin-top:10px;" data-action="go-add-manual" data-category="nutrition">Or build a custom routine</button>
    </div>
    ${bottomNavHTML('home')}`;
}

function renderNutritionProfileHTML() {
  const f = profileForm;
  const sexChips = ['male', 'female'].map(s => `<div class="freq-type-chip ${f.sex === s ? 'selected' : ''}" data-action="select-sex" data-id="${s}" role="button" tabindex="0" aria-pressed="${f.sex === s}">${s === 'male' ? 'Male' : 'Female'}</div>`).join('');
  const activityChips = ACTIVITY_LEVELS.map(a => `<div class="freq-type-chip ${f.activityLevel === a.id ? 'selected' : ''}" data-action="select-activity" data-id="${a.id}" role="button" tabindex="0" aria-pressed="${f.activityLevel === a.id}">${a.label}<span class="pts-hint">${a.hint}</span></div>`).join('');
  const goalChips = NUTRITION_GOALS.map(g => `<div class="tier-chip ${f.goal === g.id ? 'selected' : ''}" data-action="select-nutrition-goal" data-id="${g.id}" role="button" tabindex="0" aria-pressed="${f.goal === g.id}">${g.label}</div>`).join('');
  return `${headerWithBack('Nutrition profile')}
    <div class="screen">
      <div class="form-group"><label>Age</label><input type="number" id="profile-age-input" min="13" max="100" value="${f.age}"></div>
      <div class="form-group"><label>Sex</label><div class="freq-type-grid">${sexChips}</div></div>
      <div class="form-group"><label>Weight (kg)</label><input type="number" id="profile-weight-input" min="30" max="300" value="${f.weightKg}"></div>
      <div class="form-group"><label>Height (cm)</label><input type="number" id="profile-height-input" min="100" max="250" value="${f.heightCm}"></div>
      <div class="form-group"><label>Activity level</label><div class="freq-type-grid">${activityChips}</div></div>
      <div class="form-group"><label>Goal</label><div class="tier-grid">${goalChips}</div></div>
      <p style="font-size:11.5px;color:var(--text-muted);">Used only to estimate calorie/protein targets via standard formulas, stored on this device. Not medical advice — consult a professional for personalized guidance.</p>
      <button class="primary-btn" data-action="save-profile">Save profile</button>
    </div>
    ${bottomNavHTML('home')}`;
}

/* ---------- meal plan builder ---------- */
const MEAL_TAG_FILTERS = [
  { id: '', label: 'All' },
  { id: 'high-protein', label: 'High protein' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'quick', label: 'Quick' },
  { id: 'cutting-friendly', label: 'Cutting' },
  { id: 'bulking-friendly', label: 'Bulking' }
];
function itemMacros(item) {
  const ref = item.type === 'food' ? findFood(item.refId) : findRecipe(item.refId);
  if (!ref) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const base = item.type === 'food' ? ref : ref.macros;
  return { calories: base.calories * item.qty, protein: base.protein * item.qty, carbs: base.carbs * item.qty, fat: base.fat * item.qty };
}
function sumMacros(items) {
  return items.reduce((acc, item) => {
    const m = itemMacros(item);
    acc.calories += m.calories; acc.protein += m.protein; acc.carbs += m.carbs; acc.fat += m.fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
function searchMealItems(query, tag) {
  const q = (query || '').toLowerCase().trim();
  const recipes = RECIPE_DB.map(r => ({ id: r.id, name: r.name, tags: r.tags, type: 'recipe', refId: r.id, serving: '1 serving', ...r.macros }));
  const foods = FOOD_DB.map(f => ({ ...f, type: 'food', refId: f.id }));
  let all = [...recipes, ...foods];
  if (tag) all = all.filter(i => i.tags && i.tags.includes(tag));
  if (q) all = all.filter(i => i.name.toLowerCase().includes(q));
  return all.slice(0, 30);
}
function savedPlansSectionHTML() {
  if (!state.mealPlans.length) return '';
  const rows = state.mealPlans.map(p => {
    const totals = sumMacros(p.items);
    return `<div class="goal-card" style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:700;font-size:13.5px;">${escapeHtml(p.name)}</div>
        <div style="font-size:12px;color:var(--text-muted);">${Math.round(totals.calories)} kcal · ${Math.round(totals.protein)}g protein · ${p.items.length} item${p.items.length === 1 ? '' : 's'}</div>
      </div>
      <button class="delete-link" style="margin:0;" data-action="delete-meal-plan" data-id="${p.id}">Delete</button>
    </div>`;
  }).join('');
  return `<div class="section-label" style="margin-top:20px;">Saved plans</div>${rows}`;
}
function renderMealPlanBuilderHTML() {
  const results = searchMealItems(mealSearchQuery, mealFilterTag);
  const tagChips = MEAL_TAG_FILTERS.map(t => `<div class="freq-type-chip ${mealFilterTag === t.id ? 'selected' : ''}" data-action="select-meal-tag" data-id="${t.id}" role="button" tabindex="0" aria-pressed="${mealFilterTag === t.id}">${t.label}</div>`).join('');
  const resultRows = results.length ? results.map(item => `<div class="meal-item-row">
    <div class="meal-item-info">
      <div class="meal-item-name">${item.type === 'recipe' ? '🍱' : '🥗'} ${escapeHtml(item.name)}</div>
      <div class="meal-item-macros">${Math.round(item.calories)} kcal · ${Math.round(item.protein)}g P · ${Math.round(item.carbs)}g C · ${Math.round(item.fat)}g F${item.type === 'food' ? ' · ' + item.serving : ''}</div>
    </div>
    <button class="stepper-btn" data-action="add-plan-item" data-id="${item.refId}" data-type="${item.type}" aria-label="Add ${escapeHtml(item.name)}">+</button>
  </div>`).join('') : `<p style="font-size:13px;color:var(--text-muted);text-align:center;">No matches — try a different search or filter.</p>`;

  const draftTotals = sumMacros(mealPlanDraft.items);
  const target = state.profile ? calcTargets(state.profile) : null;
  const draftRows = mealPlanDraft.items.map((item, idx) => {
    const ref = item.type === 'food' ? findFood(item.refId) : findRecipe(item.refId);
    if (!ref) return '';
    const m = itemMacros(item);
    return `<div class="meal-item-row">
      <div class="meal-item-info">
        <div class="meal-item-name">${escapeHtml(ref.name)}${item.qty !== 1 ? ' ×' + item.qty : ''}</div>
        <div class="meal-item-macros">${Math.round(m.calories)} kcal · ${Math.round(m.protein)}g protein</div>
      </div>
      <button class="stepper-btn" data-action="remove-plan-item" data-idx="${idx}" aria-label="Remove ${escapeHtml(ref.name)}">−</button>
    </div>`;
  }).join('');

  return `${headerWithBack('Meal plan builder')}
    <div class="screen">
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:0;">A planning tool, not a food diary — assemble meals that fit your targets and save them for reference. Values are approximate estimates, not medical or dietary advice.</p>
      <div class="form-group"><input type="text" id="meal-search-input" placeholder="Search foods & recipes…" value="${escapeHtml(mealSearchQuery)}"></div>
      <div class="freq-type-grid" style="margin-bottom:12px;">${tagChips}</div>
      <div class="section-label">Results</div>
      ${resultRows}
      <div class="section-label" style="margin-top:20px;">Your plan (${mealPlanDraft.items.length})</div>
      ${draftRows || '<p style="font-size:13px;color:var(--text-muted);">Nothing added yet — tap + on a food or recipe above.</p>'}
      <div class="goal-card" style="display:block;margin-top:10px;">
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <div class="plant-stat" style="flex:1;min-width:70px;"><div class="num">${Math.round(draftTotals.calories)}</div><div class="lbl">kcal${target ? ' / ' + target.calories : ''}</div></div>
          <div class="plant-stat" style="flex:1;min-width:70px;"><div class="num">${Math.round(draftTotals.protein)}g</div><div class="lbl">protein${target ? ' / ' + target.protein + 'g' : ''}</div></div>
          <div class="plant-stat" style="flex:1;min-width:70px;"><div class="num">${Math.round(draftTotals.carbs)}g</div><div class="lbl">carbs</div></div>
          <div class="plant-stat" style="flex:1;min-width:70px;"><div class="num">${Math.round(draftTotals.fat)}g</div><div class="lbl">fat</div></div>
        </div>
      </div>
      <div class="form-group" style="margin-top:14px;"><input type="text" id="meal-plan-name-input" placeholder="Name this plan (e.g. Cutting weekday)" value="${escapeHtml(mealPlanName)}"></div>
      <button class="primary-btn" data-action="save-meal-plan" ${mealPlanDraft.items.length === 0 ? 'disabled' : ''}>Save meal plan</button>
      ${savedPlansSectionHTML()}
    </div>
    ${bottomNavHTML('home')}`;
}

const nutritionHandlers = {
  'go-nutrition-profile': () => { navStack.push(view); resetProfileForm(); view = { name: 'nutritionProfile' }; render(); },
  'select-activity': (el) => { profileForm.activityLevel = el.dataset.id; render(); },
  'select-nutrition-goal': (el) => { profileForm.goal = el.dataset.id; render(); },
  'select-sex': (el) => { profileForm.sex = el.dataset.id; render(); },
  'save-profile': () => {
    state.profile = { ...profileForm };
    saveState();
    navStack = [];
    view = { name: 'nutritionHub' };
    render();
    showToast('Nutrition profile saved');
  },
  'quick-add-nutrition': (el) => {
    const sg = nutritionSubgoals().find(s => s.id === el.dataset.id);
    if (!sg || !sg.template) return;
    const goal = buildGoal({ name: sg.template.name, category: 'nutrition', frequency: sg.template.frequency, tier: sg.template.tier, mode: sg.template.mode });
    state.goals.push(goal);
    saveState();
    navStack = [];
    view = { name: 'home' };
    render();
    showToast(`${sg.emoji} ${sg.template.name} added`);
  },
  'go-meal-plan-builder': () => {
    navStack.push(view);
    mealPlanDraft = { items: [] };
    mealSearchQuery = '';
    mealFilterTag = '';
    mealPlanName = '';
    view = { name: 'mealPlanBuilder' };
    render();
  },
  'select-meal-tag': (el) => { mealFilterTag = el.dataset.id; render(); },
  'add-plan-item': (el) => {
    const id = el.dataset.id, type = el.dataset.type;
    const existing = mealPlanDraft.items.find(i => i.refId === id && i.type === type);
    if (existing) existing.qty += 1;
    else mealPlanDraft.items.push({ refId: id, type, qty: 1 });
    render();
  },
  'remove-plan-item': (el) => {
    const idx = parseInt(el.dataset.idx, 10);
    mealPlanDraft.items.splice(idx, 1);
    render();
  },
  'save-meal-plan': () => {
    const name = (mealPlanName || '').trim() || `Meal plan ${state.mealPlans.length + 1}`;
    state.mealPlans.push({ id: 'mp' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, createdAt: todayISO(), items: mealPlanDraft.items });
    saveState();
    mealPlanDraft = { items: [] };
    mealPlanName = '';
    render();
    showToast('Meal plan saved');
  },
  'delete-meal-plan': (el) => {
    state.mealPlans = state.mealPlans.filter(p => p.id !== el.dataset.id);
    saveState();
    render();
  }
};
