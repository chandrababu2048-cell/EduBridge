import { motion } from 'framer-motion';
import { SUBJECT_THEMES, CATEGORIES, TRACKS_BY_CATEGORY } from '../subjectThemes';

const CATEGORY_META = {
  School:       { label: 'School',      tagline: 'Maths, Science & English', icon: '📚' },
  'Life Skills': { label: 'Life Skills', tagline: 'Citizenship & wellbeing',  icon: '🌱' }
};

const SubjectSelector = ({ subject, setSubject }) => (
  <div className="w-full">
    <div className="flex flex-col gap-4">
      {CATEGORIES.map((cat) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{CATEGORY_META[cat].icon}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{CATEGORY_META[cat].label}</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{CATEGORY_META[cat].tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRACKS_BY_CATEGORY[cat].map((name, i) => {
              const theme = SUBJECT_THEMES[name];
              const selected = subject === name;
              return (
                <motion.button
                  key={name}
                  onClick={() => setSubject(name)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: selected ? 'var(--color-surface2)' : 'transparent',
                    border: selected ? `1.5px solid var(--color-primary)` : '1.5px solid var(--color-border)',
                    color: selected ? 'var(--color-text)' : 'var(--color-muted)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ opacity: 0.85 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-base">{theme.emoji}</span>
                  <span>{name}</span>
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
