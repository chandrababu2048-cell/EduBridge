// SUBJECT_THEMES — every learning track in EduBridge.
// Two categories: "School" (academics) and "Life Skills" (citizenship & values).
// Each track has a neon color, mascot, greeting, and starter example questions.
export const SUBJECT_THEMES = {
  // ---------- SCHOOL ----------
  Math: {
    category: 'School',
    color: '#FF6B6B',
    glow: 'rgba(255,107,107,0.45)',
    text: 'text-[#FF6B6B]',
    emoji: '🔢',
    mascot: '🦉',
    greeting: "Let's crunch some numbers! 🔢",
    examples: ['What is 7 × 8?', 'How do fractions work?', 'Help me with shapes!']
  },
  Science: {
    category: 'School',
    color: '#00FF88',
    glow: 'rgba(0,255,136,0.45)',
    text: 'text-[#00FF88]',
    emoji: '🔬',
    mascot: '🦊',
    greeting: "Let's discover something amazing! 🔬",
    examples: ['Why is the sky blue?', 'How do plants grow?', 'What are the planets?']
  },
  English: {
    category: 'School',
    color: '#00D4FF',
    glow: 'rgba(0,212,255,0.45)',
    text: 'text-[#00D4FF]',
    emoji: '📖',
    mascot: '🦋',
    greeting: "Let's explore words together! 📖",
    examples: ['What is a noun?', 'Help me spell "because"', 'Make a sentence with "happy"']
  },

  // ---------- LIFE SKILLS ----------
  'Civic Sense': {
    category: 'Life Skills',
    color: '#FFB020',
    glow: 'rgba(255,176,32,0.45)',
    text: 'text-[#FFB020]',
    emoji: '🏙️',
    mascot: '🐘',
    greeting: "Let's learn how to make our community better! 🏙️",
    examples: ['Why should we keep our city clean?', 'What are traffic rules?', 'How can I help my neighbours?']
  },
  'My Rights': {
    category: 'Life Skills',
    color: '#C084FC',
    glow: 'rgba(192,132,252,0.45)',
    text: 'text-[#C084FC]',
    emoji: '⚖️',
    mascot: '🦅',
    greeting: "Let's learn about your rights and asking questions! ⚖️",
    examples: ['What are my fundamental rights?', 'Is it okay to ask "why"?', 'What is the right to education?']
  },
  'Respect & Safety': {
    category: 'Life Skills',
    color: '#FF8FB1',
    glow: 'rgba(255,143,177,0.45)',
    text: 'text-[#FF8FB1]',
    emoji: '🤝',
    mascot: '🐨',
    greeting: "Let's learn about respect, kindness, and staying safe! 🤝",
    examples: ['Are boys and girls equal?', 'What is good touch and bad touch?', 'What if someone makes me feel unsafe?']
  },
  Communication: {
    category: 'Life Skills',
    color: '#2DD4BF',
    glow: 'rgba(45,212,191,0.45)',
    text: 'text-[#2DD4BF]',
    emoji: '💬',
    mascot: '🦜',
    greeting: "Let's practice speaking with confidence! 💬",
    examples: ['How do I introduce myself?', 'How can I be a good listener?', 'Help me speak more confidently']
  }
};

// Ordered list of categories for the selector UI
export const CATEGORIES = ['School', 'Life Skills'];

// Tracks grouped by category (preserves insertion order)
export const TRACKS_BY_CATEGORY = CATEGORIES.reduce((acc, cat) => {
  acc[cat] = Object.keys(SUBJECT_THEMES).filter((name) => SUBJECT_THEMES[name].category === cat);
  return acc;
}, {});
