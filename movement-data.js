/* Movement hub sub-goal templates — quick-add presets shown when a user
   picks the Movement category, so they don't hit a blank manual form first. */
const MOVEMENT_SUBGOALS = [
  {
    id: 'strength',
    emoji: '🏋️',
    title: 'Strength training',
    description: 'Build muscle and get stronger with regular resistance sessions.',
    template: { name: 'Strength training session', frequency: { type: 'times_per_week', timesPerWeek: 3 }, tier: 'hard', mode: 'adaptive' }
  },
  {
    id: 'cardio',
    emoji: '🏃',
    title: 'Cardio / steps',
    description: 'Get your heart rate up — running, cycling, or just hitting a daily step count.',
    template: { name: '30-minute cardio', frequency: { type: 'daily' }, tier: 'moderate', mode: 'adaptive' }
  },
  {
    id: 'flexibility',
    emoji: '🧘',
    title: 'Flexibility & mobility',
    description: 'Short daily stretching or mobility work to stay loose and avoid injury.',
    template: { name: '10-minute stretch / mobility', frequency: { type: 'daily' }, tier: 'easy', mode: 'adaptive' }
  },
  {
    id: 'sport',
    emoji: '⚽',
    title: 'Sport-specific practice',
    description: 'Practice sessions for a specific sport or skill you’re working on.',
    template: { name: 'Practice session', frequency: { type: 'times_per_week', timesPerWeek: 2 }, tier: 'moderate', mode: 'adaptive' }
  }
];
