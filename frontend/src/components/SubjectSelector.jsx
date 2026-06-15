// SubjectSelector — glowing dark cards grouped into School + Life Skills.
import { motion } from 'framer-motion';
import { SUBJECT_THEMES, CATEGORIES, TRACKS_BY_CATEGORY } from '../subjectThemes';

const CATEGORY_META = {
  School: { label: '📚 School', tagline: 'Maths, Science & English' },
  'Life Skills': { label: '🌟 Life Skills', tagline: 'Be a good, confident citizen' }
};

const SubjectSelector = ({ subject, setSubject }) => (
  <div className="w-full max-w-md">
    <motion.h2
      className="text-xl font-black text-center text-white mb-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      Choose Your Quest! ⚔️
    </motion.h2>

    <div className="flex flex-col gap-5">
      {CATEGORIES.map((cat) => (
        <div key={cat}>
          <div className="mb-2 text-center">
            <p className="text-sm font-black text-white">{CATEGORY_META[cat].label}</p>
            <p className="text-[11px] text-[#9CA3AF]">{CATEGORY_META[cat].tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {TRACKS_BY_CATEGORY[cat].map((name, i) => {
              const theme = SUBJECT_THEMES[name];
              const selected = subject === name;
              return (
                <motion.button
                  key={name}
                  onClick={() => setSubject(name)}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 font-bold relative overflow-hidden w-[104px] min-h-[88px]"
                  style={{
                    borderColor: selected ? theme.color : 'rgba(255,255,255,0.1)',
                    background: selected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    boxShadow: selected ? `0 0 22px ${theme.glow}` : 'none',
                    color: selected ? theme.color : '#9CA3AF'
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
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
                  <span className="text-3xl mb-1 relative z-10">{theme.emoji}</span>
                  <span className="relative z-10 font-black text-xs text-center leading-tight">{name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SubjectSelector;
