// LevelUpModal — full-screen celebration when the child reaches a new level.
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiEffect from './ConfettiEffect';

const LevelUpModal = ({ show, level, levelData, onClose }) => (
  <AnimatePresence>
    {show && (
      <>
        <ConfettiEffect trigger={show ? `level-${level}` : null} type="levelup" />
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#111827] border border-[#6C63FF]/50 rounded-3xl p-8 mx-4 text-center max-w-sm"
            style={{ boxShadow: '0 0 60px rgba(108, 99, 255, 0.4)' }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {levelData?.emoji}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <p className="text-[#6C63FF] font-black text-sm uppercase tracking-widest mb-2">⬆️ Level Up!</p>
              <h2 className="text-white font-black text-3xl mb-1">Level {level}</h2>
              <p className="text-[#00D4FF] font-bold text-xl mb-6">{levelData?.name}</p>
              <p className="text-[#9CA3AF] text-sm mb-6">
                You're on fire! Keep asking questions to unlock more rewards! 🔥
              </p>
            </motion.div>

            <motion.button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-black text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', boxShadow: '0 0 20px rgba(108, 99, 255, 0.5)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Keep Learning! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default LevelUpModal;
