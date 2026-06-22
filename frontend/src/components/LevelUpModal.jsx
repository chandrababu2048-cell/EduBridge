import { motion, AnimatePresence } from 'framer-motion';
import ConfettiEffect from './ConfettiEffect';

const LevelUpModal = ({ show, level, levelData, onClose }) => (
  <AnimatePresence>
    {show && (
      <>
        <ConfettiEffect trigger={show ? `level-${level}` : null} type="levelup" />
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl p-8 text-center flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: 'spring', bounce: 0.35 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="text-7xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {levelData?.emoji}
            </motion.div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-primary)' }}>Level Up!</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Level {level}</h2>
              <p className="text-base font-medium" style={{ color: 'var(--color-muted)' }}>{levelData?.name}</p>
            </div>

            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Keep asking questions to unlock more rewards!
            </p>

            <motion.button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'var(--color-primary)' }}
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.97 }}
            >
              Keep Learning
            </motion.button>
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default LevelUpModal;
