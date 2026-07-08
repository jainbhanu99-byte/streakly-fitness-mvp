/* First-run (and replayable) screen-preview carousel. */
const ONBOARDING_SLIDES = [
  { emoji: '🌱', title: 'Track any routine', body: 'Check in with a tap, build streaks, and earn points for consistency — fitness, nutrition, sleep, or anything else you want to stick with.' },
  { emoji: '🪴', title: 'Watch your plant grow', body: 'Every point you earn grows your plant from a seed into a flourishing tree. Missed days dim it slightly — they never reset your progress.' },
  { emoji: '🛍️', title: 'Customize your garden', body: 'Spend points in the shop on pots, backgrounds, and decorations — or grab a streak freeze for the days that don’t go to plan.' },
  { emoji: '📊', title: 'See your consistency', body: 'Streaks, weekly completion, and category breakdowns at a glance — plus export a backup any time so your data is never trapped in one browser.' }
];

function renderOnboardingHTML() {
  const i = Math.max(0, Math.min(view.slide || 0, ONBOARDING_SLIDES.length - 1));
  const slide = ONBOARDING_SLIDES[i];
  const isLast = i === ONBOARDING_SLIDES.length - 1;
  const dots = ONBOARDING_SLIDES.map((_, idx) => `<span class="onboarding-dot ${idx === i ? 'active' : ''}"></span>`).join('');
  return `<div class="onboarding-screen">
    <div class="onboarding-skip-row">
      <button class="link-btn" data-action="onboarding-skip">Skip</button>
    </div>
    <div class="onboarding-slide">
      <div class="onboarding-emoji">${slide.emoji}</div>
      <h2>${slide.title}</h2>
      <p>${slide.body}</p>
    </div>
    <div class="onboarding-dots">${dots}</div>
    <button class="primary-btn" data-action="onboarding-next" data-slide="${i}">${isLast ? 'Get started' : 'Next'}</button>
  </div>`;
}

const onboardingHandlers = {
  'onboarding-next': (el) => {
    const i = parseInt(el.dataset.slide, 10);
    if (i >= ONBOARDING_SLIDES.length - 1) { handlers['onboarding-skip'](); return; }
    view = { name: 'onboarding', slide: i + 1 };
    render();
  },
  'onboarding-skip': () => {
    state.meta.onboardingSeen = true;
    saveState();
    navStack = [];
    view = { name: 'home' };
    render();
  },
  'replay-onboarding': () => {
    navStack = [];
    view = { name: 'onboarding', slide: 0 };
    render();
  }
};
