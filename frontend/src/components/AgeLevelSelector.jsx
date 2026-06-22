import { motion } from 'framer-motion';

const LEVELS = [
  { value: 'little', label: 'Little Kids', age: '6–10 years', emoji: '🐣' },
  { value: 'older',  label: 'Older Kids',  age: '11–14 years', emoji: '🦋' }
];

const AgeLevelSelector = ({ ageLevel, setAgeLevel }) => (
  <div className="w-full">
    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Age group</p>
    <div className="flex gap-2">
      {LEVELS.map((level, i) => {
        const selected = ageLevel === level.value;
        return (
          <motion.button
            key={level.value}
            onClick={() => setAgeLevel(level.value)}
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
            style={{
              background: selected ? 'var(--color-surface2)' : 'transparent',
              border: selected ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
              color: selected ? 'var(--color-text)' : 'var(--color-muted)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ opacity: 0.85 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">{level.emoji}</span>
            <div>
              <p className="font-semibold text-sm leading-tight">{level.label}</p>
              <p className="text-xs leading-tight" style={{ color: 'var(--color-muted)' }}>{level.age}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default AgeLevelSelector;
