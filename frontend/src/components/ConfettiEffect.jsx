// ConfettiEffect — fires canvas-confetti whenever `trigger` changes.
// type: 'normal' (per answer) | 'badge' | 'levelup' (epic).
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const ConfettiEffect = ({ trigger, type = 'normal' }) => {
  const lastTrigger = useRef(null);

  useEffect(() => {
    // Only fire on a real, new trigger value (skip initial null)
    if (trigger === null || trigger === undefined || trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;

    if (type === 'levelup') {
      const end = Date.now() + 2500;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6C63FF', '#00D4FF', '#FFD700'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6C63FF', '#00D4FF', '#FFD700'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    } else if (type === 'badge') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FF6B6B'] });
    } else {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#6C63FF', '#00D4FF', '#00FF88'] });
    }
  }, [trigger, type]);

  return null;
};

export default ConfettiEffect;
