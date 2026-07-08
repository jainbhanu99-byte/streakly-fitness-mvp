/* Movement hub — shown instead of the blank manual form when a user picks
   the Movement category, so they land on concrete options instead of a
   dead-end blank form. */
function subgoalCardHTML(sg, addAction) {
  return `<div class="subgoal-card">
    <div class="subgoal-emoji">${sg.emoji}</div>
    <div class="subgoal-info">
      <div class="subgoal-title">${sg.title}</div>
      <div class="subgoal-desc">${sg.description}</div>
      <div class="subgoal-meta">${freqLabel({ frequency: sg.template.frequency })} · ${tierOf(sg.template.tier).name}</div>
    </div>
    <button class="secondary-btn" style="width:auto;padding:8px 16px;flex-shrink:0;" data-action="${addAction}" data-id="${sg.id}">Add</button>
  </div>`;
}

function renderMovementHubHTML() {
  const cards = MOVEMENT_SUBGOALS.map(sg => subgoalCardHTML(sg, 'quick-add-movement')).join('');
  return `${headerWithBack('Movement')}
    <div class="screen">
      <p style="font-size:13px;color:var(--text-muted);margin-top:0;">Pick a focus to get started — you can fine-tune frequency and difficulty any time from the routine's detail screen.</p>
      ${cards}
      <button class="link-btn" style="margin-top:10px;" data-action="go-add-manual" data-category="movement">Or build a custom routine</button>
    </div>
    ${bottomNavHTML('home')}`;
}

const movementHandlers = {
  'quick-add-movement': (el) => {
    const sg = MOVEMENT_SUBGOALS.find(s => s.id === el.dataset.id);
    if (!sg) return;
    const goal = buildGoal({ name: sg.template.name, category: 'movement', frequency: sg.template.frequency, tier: sg.template.tier, mode: sg.template.mode });
    state.goals.push(goal);
    saveState();
    navStack = [];
    view = { name: 'home' };
    render();
    showToast(`${sg.emoji} ${sg.template.name} added`);
  }
};
