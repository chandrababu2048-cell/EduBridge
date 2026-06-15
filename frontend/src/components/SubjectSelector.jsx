// SubjectSelector — glowing dark cards. Picks Math / Science / English.
import { motion } from 'framer-motion';
import { SUBJECT_THEMES } from '../subjectThemes';

const subjects = ['Math', 'Science', 'English'];

const SubjectSelector = ({ subject, setSubject }) => (
  <div className="w-full max-w-sm">
    <motion.h2
      className="text-xl font-black text-center text-white mb-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      Choose Your Quest! ⚔️
    </motion.h2>
    <div className="flex gap-3 justify-center">
      {subjects.map((name, i) => {
        const theme = SUBJECT_THEMES[name];
        const selected = subject === name;
        return (
          <motion.button
            key={name}
            onClick={() => setSubject(name)}
            className="flex flex-col items-center p-5 rounded-2xl border-2 font-bold relative overflow-hidden min-w-[92px]"
            style={{
              borderColor: selected ? theme.color : 'rgba(255,255,255,0.1)',
              background: selected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              boxShadow: selected ? `0 0 22px ${theme.glow}` : 'none',
              color: selected ? theme.color : '#9CA3AF'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            {selected && (
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(circle, ${theme.color}, transparent)` }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <span className="text-4xl mb-2 relative z-10">{theme.emoji}</span>
            <span className="relative z-10 font-black">{name}</span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default SubjectSelector;
