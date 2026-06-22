import { motion } from 'framer-motion';

const XPBar = ({ xp, level, levelData, nextLevelXP }) => {
  const atMax = nextLevelXP <= levelData.xpRequired;
  const progress = atMax
    ? 100
    : ((xp - levelData.xpRequired) / (nextLevelXP - levelData.xpRequired)) * 100;

  return (
    <div className="w-full px-5 py-2" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface2)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--color-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs" style={{ color: 'var(--color-muted)', minWidth: '60px', textAlign: 'right' }}>
          {atMax ? 'Max level' : `${Math.max(0, nextLevelXP - xp)} to next`}
        </span>
      </div>
    </div>
  );
};

export default XPBar;
