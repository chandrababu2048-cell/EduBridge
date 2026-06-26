import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StudyPlan = ({ stats, ageLevel, onSelectSubject }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchPlan = async () => {
    if (plan) { setOpen(true); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/study-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats, ageLevel }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setPlan(data);
      setOpen(true);
    } catch {
      // silently fail — button stays available to retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={fetchPlan}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)', background: 'transparent' }}
      >
        {loading ? 'Thinking…' : 'Get my study plan'}
      </button>

      <AnimatePresence>
        {open && plan && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 rounded-xl p-4 flex flex-col gap-3"
            style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex justify-between items-start">
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-text)' }}>{plan.message}</p>
              <button onClick={() => setOpen(false)} className="text-lg leading-none ml-3" style={{ color: 'var(--color-muted)' }}>×</button>
            </div>

            {plan.nextSteps?.map((step) => (
              <motion.button
                key={step.subject}
                onClick={() => { onSelectSubject?.(step.subject); setOpen(false); }}
                className="flex items-center gap-3 text-left p-3 rounded-lg transition-colors"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                whileHover={{ opacity: 0.8 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{step.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{step.subject}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{step.tip}</p>
                </div>
                <span className="text-sm" style={{ color: 'var(--color-primary)' }}>→</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyPlan;
