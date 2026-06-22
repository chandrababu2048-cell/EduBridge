// StudyPlan — personalized next-step recommendations from the Study Planner Agent.
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
        className="w-full py-3 rounded-2xl font-bold text-sm border border-white/10 text-[#9CA3AF] hover:text-white hover:border-[#6C63FF] transition-all disabled:opacity-50"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        {loading ? '🤔 Thinking…' : '🗺️ Get my study plan'}
      </button>

      <AnimatePresence>
        {open && plan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.25)' }}
          >
            <div className="flex justify-between items-start">
              <p className="text-white font-bold text-sm leading-relaxed flex-1">{plan.message}</p>
              <button onClick={() => setOpen(false)} className="text-[#9CA3AF] ml-3 text-lg leading-none">×</button>
            </div>

            {plan.nextSteps?.map((step) => (
              <motion.button
                key={step.subject}
                onClick={() => { onSelectSubject?.(step.subject); setOpen(false); }}
                className="flex items-center gap-3 text-left p-3 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(108,99,255,0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">{step.emoji}</span>
                <div>
                  <p className="text-white font-bold text-sm">{step.subject}</p>
                  <p className="text-[#9CA3AF] text-xs">{step.tip}</p>
                </div>
                <span className="ml-auto text-[#6C63FF] font-bold text-sm">→</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyPlan;
