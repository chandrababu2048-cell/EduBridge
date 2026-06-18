import { describe, it, expect } from 'vitest';
import { LEVELS, XP_REWARDS, levelForXP } from '../data/levels.js';

describe('LEVELS', () => {
  it('has exactly 6 levels', () => {
    expect(LEVELS).toHaveLength(6);
  });

  it('starts at level 1 requiring 0 XP', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].xpRequired).toBe(0);
  });

  it('ends at level 6', () => {
    expect(LEVELS[LEVELS.length - 1].level).toBe(6);
  });

  it('has strictly ascending XP thresholds', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].xpRequired).toBeGreaterThan(LEVELS[i - 1].xpRequired);
    }
  });

  it('has unique level numbers', () => {
    const nums = LEVELS.map((l) => l.level);
    expect(new Set(nums).size).toBe(nums.length);
  });

  it('has all required fields on every level', () => {
    for (const l of LEVELS) {
      expect(l).toHaveProperty('level');
      expect(l).toHaveProperty('name');
      expect(l).toHaveProperty('xpRequired');
      expect(l).toHaveProperty('emoji');
      expect(typeof l.name).toBe('string');
      expect(l.name.length).toBeGreaterThan(0);
    }
  });
});

describe('levelForXP', () => {
  it('returns level 1 at 0 XP', () => {
    expect(levelForXP(0).level).toBe(1);
  });

  it('returns level 1 just below the level-2 threshold (99 XP)', () => {
    expect(levelForXP(99).level).toBe(1);
  });

  it('returns level 2 at exactly 100 XP', () => {
    expect(levelForXP(100).level).toBe(2);
  });

  it('returns level 3 at exactly 250 XP', () => {
    expect(levelForXP(250).level).toBe(3);
  });

  it('returns level 4 at exactly 500 XP', () => {
    expect(levelForXP(500).level).toBe(4);
  });

  it('returns level 5 at exactly 1000 XP', () => {
    expect(levelForXP(1000).level).toBe(5);
  });

  it('returns level 6 at exactly 2000 XP', () => {
    expect(levelForXP(2000).level).toBe(6);
  });

  it('returns level 6 for very high XP', () => {
    expect(levelForXP(99999).level).toBe(6);
  });

  it('returns level 1 for negative XP', () => {
    expect(levelForXP(-50).level).toBe(1);
  });

  it('returns a complete level object', () => {
    const result = levelForXP(100);
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('xpRequired');
    expect(result).toHaveProperty('emoji');
  });
});

describe('XP_REWARDS', () => {
  it('has all expected reward keys', () => {
    expect(XP_REWARDS).toHaveProperty('firstQuestion');
    expect(XP_REWARDS).toHaveProperty('eachQuestion');
    expect(XP_REWARDS).toHaveProperty('streakBonus');
    expect(XP_REWARDS).toHaveProperty('subjectMaster');
  });

  it('all reward values are positive integers', () => {
    for (const value of Object.values(XP_REWARDS)) {
      expect(value).toBeGreaterThan(0);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('firstQuestion reward is larger than eachQuestion', () => {
    expect(XP_REWARDS.firstQuestion).toBeGreaterThan(XP_REWARDS.eachQuestion);
  });
});
