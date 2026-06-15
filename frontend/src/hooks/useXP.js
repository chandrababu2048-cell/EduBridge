// useXP — experience points + level system, persisted in localStorage.
// Awards XP, derives the current level, and flags when a level-up happens
// so the app can show the celebration modal.
import { useState, useCallback, useRef } from 'react';
import { LEVELS, levelForXP } from '../data/levels.js';

const STORAGE_KEY = 'edubridge_xp';

export const useXP = () => {
  const [xp, setXP] = useState(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    return Number.isFinite(saved) ? saved : 0;
  });
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Track the last level we showed so we only celebrate genuine increases
  const lastLevelRef = useRef(levelForXP(xp).level);

  const addXP = useCallback((amount) => {
    setXP((prev) => {
      const next = prev + amount;
      localStorage.setItem(STORAGE_KEY, String(next));

      const newLevel = levelForXP(next).level;
      if (newLevel > lastLevelRef.current) {
        lastLevelRef.current = newLevel;
        setShowLevelUp(true);
      }
      return next;
    });
  }, []);

  const levelData = levelForXP(xp);
  const level = levelData.level;
  const nextLevel = LEVELS.find((l) => l.level === level + 1);
  const nextLevelXP = nextLevel ? nextLevel.xpRequired : levelData.xpRequired;

  return { xp, level, levelData, nextLevel, nextLevelXP, addXP, showLevelUp, setShowLevelUp, LEVELS };
};
