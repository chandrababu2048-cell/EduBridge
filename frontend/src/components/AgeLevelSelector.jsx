// AgeLevelSelector — dark animated age-group picker.
import { motion } from 'framer-motion';

const LEVELS = [
  { value: 'little', label: 'Little Kids', age: '6-10', emoji: '🐣' },
  { value: 'older', label: 'Older Kids', age: '11-14', emoji: '🦋' }
];

const ACCENT = '#00D4FF';

const AgeLevelSelector = ({ ageLevel, setAgeLevel }) => (
  <div className="w-full max-w-sm">
    <motion.h2
      className="text-xl font-black text-center text-white mb-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      How old are you? 🎂
    </motion.h2>
    <div className="flex gap-3 justify-center">
      {LEVELS.map((level, i) => {
        const selected = ageLevel === level.value;
        return (
          <motion.button
            key={level.value}
            onClick={() => setAgeLevel(level.value)}
            className="flex flex-col items-center p-4 rounded-2xl border-2 font-bold min-w-[120px]"
            style={{
              borderColor: selected ? ACCENT : 'rgba(255,255,255,0.1)',
              background: selected ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
              boxShadow: selected ? '0 0 22px rgba(0,212,255,0.35)' : 'none',
              color: selected ? ACCENT : '#9CA3AF'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl mb-1">{level.emoji}</span>
            <span className="font-black">{level.label}</span>
            <span className="text-xs opacity-80">{level.age} years</span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default AgeLevelSelector;
