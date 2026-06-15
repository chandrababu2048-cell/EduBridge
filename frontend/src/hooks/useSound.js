// useSound — tiny sound effects generated with the Web Audio API.
// No audio files needed (so nothing can 404). Respects a mute toggle that
// is saved in localStorage. Safe to call even where Web Audio is unavailable.
import { useRef, useState, useCallback } from 'react';

const MUTE_KEY = 'edubridge_muted';

// Each sound is a short sequence of beeps: [frequency(Hz), startDelay(s), duration(s)]
const PATTERNS = {
  xpGain:  [[880, 0, 0.08], [1320, 0.06, 0.1]],
  levelUp: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.25]],
  badge:   [[784, 0, 0.1], [1047, 0.1, 0.18]],
  message: [[440, 0, 0.06]],
  correct: [[659, 0, 0.1], [988, 0.1, 0.15]]
};

export const useSound = () => {
  const ctxRef = useRef(null);
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === '1');

  const play = useCallback((type) => {
    if (muted) return;
    const pattern = PATTERNS[type];
    if (!pattern) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!ctxRef.current) ctxRef.current = new AudioCtx();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      pattern.forEach(([freq, start, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        // gentle attack + decay so it sounds like a soft blip, not a click
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
    } catch {
      /* audio not available — silently ignore */
    }
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  return { play, muted, toggleMute };
};
