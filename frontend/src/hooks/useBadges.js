// useBadges — given the child's stats, works out which badges are earned and
// detects the moment a NEW one unlocks (so we can pop confetti + a toast).
import { useMemo, useRef, useState, useEffect } from 'react';
import { BADGES } from '../data/badges.js';

export const useBadges = (stats) => {
  const seenRef = useRef(new Set());
  const initializedRef = useRef(false);
  const [justUnlocked, setJustUnlocked] = useState(null);

  // Which badges are currently earned?
  const earned = useMemo(
    () => BADGES.filter((b) => {
      try { return b.condition(stats); } catch { return false; }
    }),
    [stats]
  );

  // Detect newly-earned badges. On first run we just record what's already
  // earned (no toast); after that, any new unlock fires the celebration.
  useEffect(() => {
    if (!initializedRef.current) {
      earned.forEach((b) => seenRef.current.add(b.id));
      initializedRef.current = true;
      return;
    }
    for (const b of earned) {
      if (!seenRef.current.has(b.id)) {
        seenRef.current.add(b.id);
        setJustUnlocked(b);
      }
    }
  }, [earned]);

  const earnedIds = new Set(earned.map((b) => b.id));
  const locked = BADGES.filter((b) => !earnedIds.has(b.id));

  return { allBadges: BADGES, earned, locked, justUnlocked, clearUnlocked: () => setJustUnlocked(null) };
};
