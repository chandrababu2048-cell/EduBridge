// Badge definitions. Each badge unlocks when its condition(stats) is true.
// stats shape: { totalQuestions, bySubject: {Math, Science, English}, streak, usedTelugu, learnedEarly }
export const BADGES = [
  { id: 'first_question', name: 'First Step!',      emoji: '🌟', description: 'Asked your first question',   condition: (s) => (s.totalQuestions || 0) >= 1 },
  { id: 'math_lover',     name: 'Math Lover',       emoji: '🔢', description: '10 Math questions asked',     condition: (s) => (s.bySubject?.Math || 0) >= 10 },
  { id: 'scientist',      name: 'Little Scientist', emoji: '🔬', description: '10 Science questions asked',  condition: (s) => (s.bySubject?.Science || 0) >= 10 },
  { id: 'word_wizard',    name: 'Word Wizard',      emoji: '📖', description: '10 English questions asked',  condition: (s) => (s.bySubject?.English || 0) >= 10 },
  { id: 'streak_5',       name: 'On Fire!',         emoji: '🔥', description: '5 questions in a row',        condition: (s) => (s.streak || 0) >= 5 },
  { id: 'trilingual',     name: 'Trilingual',       emoji: '🌍', description: 'Used Telugu mode',            condition: (s) => !!s.usedTelugu },
  { id: 'early_bird',     name: 'Early Bird',       emoji: '🌅', description: 'Learned before 8am',         condition: (s) => !!s.learnedEarly },
  { id: 'curious_100',    name: 'Super Curious',    emoji: '💫', description: '100 questions asked',         condition: (s) => (s.totalQuestions || 0) >= 100 }
];
