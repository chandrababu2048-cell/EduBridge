// XPBar — shows the child's level, total XP, and progress to the next level.
import { motion } from 'framer-motion';

const XPBar = ({ xp, level, levelData, nextLevelXP }) => {
  // At max level there is no "next", so show a full bar.
  const atMax = nextLevelXP <= levelData.xpRequired;
  const progress = atMax
    ? 100
    : ((xp - levelData.xpRequired) / (nextLevelXP - levelData.xpRequired)) * 100;

  return (
    <div className="w-full px-4 py-3 bg-[#111827] border-b border-white/10">
      <div className="flex items-center justify-between mb-2">
        {/* Level badge */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{levelData.emoji}</span>
          <div>
            <p className="text-xs text-[#9CA3AF] leading-tight">Level {level}</p>
            <p className="text-sm font-black text-white leading-tight">{levelData.name}</p>
          </div>
        </div>

        {/* XP counter */}
        <motion.div
          key={xp}
          className="flex items-center gap-1 bg-[#FFD700]/20 border border-[#FFD700]/30 rounded-full px-3 py-1"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-[#FFD700] text-lg">⭐</span>
          <span className="text-[#FFD700] font-black text-sm tracking-wider">{xp} XP</span>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-[#1F2937] rounded-full overflow-hidden border border-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6C63FF, #00D4FF)', boxShadow: '0 0 10px rgba(108, 99, 255, 0.5)' }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <p className="text-xs text-[#9CA3AF] mt-1 text-right">
        {atMax ? 'Max level — you legend! 🏆' : `${Math.max(0, nextLevelXP - xp)} XP to next level`}
      </p>
    </div>
  );
};

export default XPBar;
