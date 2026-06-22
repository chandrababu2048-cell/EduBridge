import { motion } from 'framer-motion';

const BadgeCollection = ({ earned, locked }) => {
  const earnedIds = new Set(earned.map((b) => b.id));
  const all = [...earned, ...locked];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Badges</h3>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{earned.length}/{all.length}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {all.map((badge, i) => {
          const isEarned = earnedIds.has(badge.id);
          return (
            <motion.div
              key={badge.id}
              className="flex flex-col items-center text-center rounded-xl p-2.5"
              style={{
                background: isEarned ? 'rgba(212,119,74,0.1)' : 'var(--color-surface2)',
                border: `1px solid ${isEarned ? 'rgba(212,119,74,0.35)' : 'var(--color-border)'}`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              title={badge.description}
            >
              <span className={`text-2xl mb-1 ${isEarned ? '' : 'grayscale opacity-30'}`}>{badge.emoji}</span>
              <span className="text-[10px] leading-tight" style={{ color: isEarned ? 'var(--color-text)' : 'var(--color-muted)' }}>
                {badge.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeCollection;
