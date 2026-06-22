import { describe, it, expect } from 'vitest';
import { BADGES } from '../data/badges.js';

const empty = { totalQuestions: 0, bySubject: {}, streak: 0, usedTelugu: false, learnedEarly: false };

describe('BADGES', () => {
  it('contains exactly 8 badges', () => {
    expect(BADGES).toHaveLength(8);
  });

  it('all badges have the required fields', () => {
    for (const b of BADGES) {
      expect(b).toHaveProperty('id');
      expect(b).toHaveProperty('name');
      expect(b).toHaveProperty('emoji');
      expect(b).toHaveProperty('description');
      expect(b).toHaveProperty('condition');
      expect(typeof b.id).toBe('string');
      expect(typeof b.condition).toBe('function');
    }
  });

  it('all badge IDs are unique', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all conditions handle empty stats without throwing', () => {
    for (const b of BADGES) {
      expect(() => b.condition(empty)).not.toThrow();
    }
  });

  it('all conditions handle a completely empty object without throwing', () => {
    for (const b of BADGES) {
      expect(() => b.condition({})).not.toThrow();
    }
  });

  describe('first_question badge', () => {
    const badge = BADGES.find((b) => b.id === 'first_question');

    it('is locked with 0 questions', () => {
      expect(badge.condition(empty)).toBe(false);
    });
    it('unlocks with exactly 1 question', () => {
      expect(badge.condition({ ...empty, totalQuestions: 1 })).toBe(true);
    });
  });

  describe('math_lover badge', () => {
    const badge = BADGES.find((b) => b.id === 'math_lover');

    it('is locked with 9 Math questions', () => {
      expect(badge.condition({ ...empty, bySubject: { Math: 9 } })).toBe(false);
    });
    it('unlocks with 10 Math questions', () => {
      expect(badge.condition({ ...empty, bySubject: { Math: 10 } })).toBe(true);
    });
    it('is locked when bySubject is missing', () => {
      expect(badge.condition({ totalQuestions: 20 })).toBe(false);
    });
  });

  describe('scientist badge', () => {
    const badge = BADGES.find((b) => b.id === 'scientist');

    it('is locked with 9 Science questions', () => {
      expect(badge.condition({ ...empty, bySubject: { Science: 9 } })).toBe(false);
    });
    it('unlocks with 10 Science questions', () => {
      expect(badge.condition({ ...empty, bySubject: { Science: 10 } })).toBe(true);
    });
  });

  describe('word_wizard badge', () => {
    const badge = BADGES.find((b) => b.id === 'word_wizard');

    it('is locked with 9 English questions', () => {
      expect(badge.condition({ ...empty, bySubject: { English: 9 } })).toBe(false);
    });
    it('unlocks with 10 English questions', () => {
      expect(badge.condition({ ...empty, bySubject: { English: 10 } })).toBe(true);
    });
  });

  describe('streak_5 badge', () => {
    const badge = BADGES.find((b) => b.id === 'streak_5');

    it('is locked with a streak of 4', () => {
      expect(badge.condition({ ...empty, streak: 4 })).toBe(false);
    });
    it('unlocks with a streak of 5', () => {
      expect(badge.condition({ ...empty, streak: 5 })).toBe(true);
    });
    it('unlocks with a streak greater than 5', () => {
      expect(badge.condition({ ...empty, streak: 10 })).toBe(true);
    });
  });

  describe('trilingual badge', () => {
    const badge = BADGES.find((b) => b.id === 'trilingual');

    it('is locked when Telugu has not been used', () => {
      expect(badge.condition(empty)).toBe(false);
    });
    it('unlocks when usedTelugu is true', () => {
      expect(badge.condition({ ...empty, usedTelugu: true })).toBe(true);
    });
  });

  describe('early_bird badge', () => {
    const badge = BADGES.find((b) => b.id === 'early_bird');

    it('is locked when learnedEarly is false', () => {
      expect(badge.condition(empty)).toBe(false);
    });
    it('unlocks when learnedEarly is true', () => {
      expect(badge.condition({ ...empty, learnedEarly: true })).toBe(true);
    });
  });

  describe('curious_100 badge', () => {
    const badge = BADGES.find((b) => b.id === 'curious_100');

    it('is locked with 99 questions', () => {
      expect(badge.condition({ ...empty, totalQuestions: 99 })).toBe(false);
    });
    it('unlocks with exactly 100 questions', () => {
      expect(badge.condition({ ...empty, totalQuestions: 100 })).toBe(true);
    });
  });
});
