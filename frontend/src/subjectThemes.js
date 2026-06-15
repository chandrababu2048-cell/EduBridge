// SUBJECT_THEMES — V3 dark/neon palette. Each subject has a glow color,
// mascot greeting, and example questions for the starter chips.
export const SUBJECT_THEMES = {
  Math: {
    color: '#FF6B6B',
    glow: 'rgba(255,107,107,0.45)',
    text: 'text-[#FF6B6B]',
    emoji: '🔢',
    greeting: "Let's crunch some numbers! 🔢",
    examples: ['What is 7 × 8?', 'How do fractions work?', 'Help me with shapes!']
  },
  Science: {
    color: '#00FF88',
    glow: 'rgba(0,255,136,0.45)',
    text: 'text-[#00FF88]',
    emoji: '🔬',
    greeting: "Let's discover something amazing! 🔬",
    examples: ['Why is the sky blue?', 'How do plants grow?', 'What are the planets?']
  },
  English: {
    color: '#00D4FF',
    glow: 'rgba(0,212,255,0.45)',
    text: 'text-[#00D4FF]',
    emoji: '📖',
    greeting: "Let's explore words together! 📖",
    examples: ['What is a noun?', 'Help me spell "because"', 'Make a sentence with "happy"']
  }
};
