import { motion } from 'framer-motion';

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function GradeSelector({ grade, setGrade }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        Your Class
      </p>
      <div className="grid grid-cols-6 gap-1.5">
        {GRADES.map((g) => {
          const active = grade === g;
          return (
            <motion.button
              key={g}
              onClick={() => setGrade(g)}
              className="rounded-lg py-1.5 text-xs font-bold transition-all"
              style={{
                background: active ? 'var(--color-primary)' : 'var(--color-surface2)',
                color: active ? 'var(--color-primary-text)' : 'var(--color-muted)',
                border: active ? '1.5px solid var(--color-primary)' : '1.5px solid transparent',
              }}
              whileTap={{ scale: 0.94 }}
            >
              {g}
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
        Class {grade} · {grade <= 5 ? '6–10 yrs' : grade <= 8 ? '11–13 yrs' : '14–17 yrs'}
      </p>
    </div>
  );
}
