// Mascot — a friendly animated character that floats and reacts to what's
// happening (idle / thinking / excited / celebrating). Changes per subject.
import { motion, AnimatePresence } from 'framer-motion';

const MASCOT_STATES = {
  idle:        { message: 'Ready to learn!' },
  thinking:    { message: 'Let me think...' },
  excited:     { message: 'Great question!' },
  celebrating: { message: "You're amazing!" },
  sleeping:    { message: 'Ask me something!' }
};

const SUBJECT_MASCOTS = { Math: '🦉', Science: '🦊', English: '🦋' };

const Mascot = ({ state = 'idle', subject, size = 'text-6xl' }) => {
  const mascotEmoji = SUBJECT_MASCOTS[subject] || '🦉';

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="relative"
        animate={state === 'excited' ? { rotate: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.35) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className={`${size} relative z-10 drop-shadow-lg`}>{mascotEmoji}</div>

        {/* Stars when celebrating */}
        {state === 'celebrating' &&
          ['⭐', '✨', '💫'].map((star, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              style={{ top: `${[-18, -18, 12][i]}px`, left: `${[-18, 64, 72][i]}px` }}
              animate={{ rotate: 360, scale: [0, 1, 0] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
            >
              {star}
            </motion.span>
          ))}
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          className="bg-[#1F2937] border border-[#6C63FF]/30 rounded-2xl px-4 py-2 text-sm text-white font-bold"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          {MASCOT_STATES[state]?.message}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Mascot;
