// BadgeCollection — a grid of all badges, showing which are earned vs locked.
import { motion } from 'framer-motion';

const BadgeCollection = ({ earned, locked }) => {
  const earnedIds = new Set(earned.map((b) => b.id));
  const all = [...earned, ...locked];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-black text-lg">🏅 Your Badges</h3>
        <span className="text-[#9CA3AF] text-sm font-bold">{earned.length}/{all.length}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {all.map((badge, i) => {
          const isEarned = earnedIds.has(badge.id);
          return (
            <motion.div
              key={badge.id}
              className="flex flex-col items-center text-center rounded-2xl p-3 border"
              style={{
                background: isEarned ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.03)',
                borderColor: isEarned ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)',
                boxShadow: isEarned ? '0 0 16px rgba(108,99,255,0.25)' : 'none'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              title={badge.description}
            >
              <span className={`text-3xl mb-1 ${isEarned ? '' : 'grayscale opacity-40'}`}>{badge.emoji}</span>
              <span className={`text-[10px] font-bold leading-tight ${isEarned ? 'text-white' : 'text-[#9CA3AF]'}`}>
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
