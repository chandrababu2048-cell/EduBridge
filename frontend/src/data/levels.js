// Level thresholds — kids climb these by earning XP for asking questions.
export const LEVELS = [
  { level: 1, name: 'Curious Cub',     xpRequired: 0,    emoji: '🐣' },
  { level: 2, name: 'Brain Explorer',  xpRequired: 100,  emoji: '🔍' },
  { level: 3, name: 'Knowledge Ninja', xpRequired: 250,  emoji: '🥷' },
  { level: 4, name: 'Science Star',    xpRequired: 500,  emoji: '⭐' },
  { level: 5, name: 'Math Wizard',     xpRequired: 1000, emoji: '🧙' },
  { level: 6, name: 'Genius Master',   xpRequired: 2000, emoji: '🏆' }
];

// XP awarded for different actions
export const XP_REWARDS = {
  firstQuestion: 50,
  eachQuestion: 10,
  streakBonus: 25,    // 5 questions in a row
  subjectMaster: 100, // 10 questions in one subject
  mastery: 25         // both practice questions right on the first try
};

// Given a total XP, return the level object the child is currently on.
export const levelForXP = (xp) => {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) current = l;
  }
  return current;
};
