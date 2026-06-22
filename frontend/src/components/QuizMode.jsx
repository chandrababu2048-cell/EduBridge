import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCORE_MESSAGES = {
  3: 'Perfect score! You\'re amazing!',
  2: 'Great job! Almost perfect!',
  1: 'Good try! Practice makes perfect!',
  0: 'Don\'t give up — you\'re learning!',
};

const QuizMode = ({ subject, ageLevel, onDone, playSound }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/agents/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, ageLevel }),
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setQuestions(data.questions); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [subject, ageLevel]);

  const handleAnswer = (letter) => {
    if (selected) return;
    setSelected(letter);
    const correct = letter === questions[current].answer;
    if (correct) {
      setScore((s) => s + 1);
      playSound?.('correct');
    }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      playSound?.('levelUp');
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const q = questions[current];
  const scoreMsg = SCORE_MESSAGES[score] ?? SCORE_MESSAGES[0];

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
      <motion.div className="text-4xl" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>⚙️</motion.div>
      <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>Generating your quiz…</p>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-3xl">😅</p>
      <p className="font-medium" style={{ color: 'var(--color-text)' }}>Couldn't load the quiz right now.</p>
      <button onClick={onDone} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>← Go back</button>
    </div>
  );

  if (finished) return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="text-6xl">🎉</div>
      <div>
        <p className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>{score}/{questions.length}</p>
        <p className="font-medium" style={{ color: 'var(--color-primary)' }}>{scoreMsg}</p>
      </div>
      <motion.button
        onClick={onDone}
        className="px-8 py-3 rounded-xl font-semibold text-white mt-2"
        style={{ background: 'var(--color-primary)' }}
        whileHover={{ opacity: 0.9 }}
        whileTap={{ scale: 0.97 }}
      >
        Keep Learning
      </motion.button>
    </motion.div>
  );

  return (
    <div className="flex-1 flex flex-col p-5 max-w-xl mx-auto w-full gap-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <button onClick={onDone} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>← Back</button>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface2)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%`, background: 'var(--color-primary)' }}
          />
        </div>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{current + 1}/{questions.length}</span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex flex-col gap-3"
        >
          <div className="rounded-xl p-5 card">
            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>Question {current + 1}</p>
            <p className="font-medium text-base leading-relaxed" style={{ color: 'var(--color-text)' }}>{q.question}</p>
          </div>

          <div className="flex flex-col gap-2">
            {q.options.map((opt) => {
              const letter = opt[0];
              const isCorrect = letter === q.answer;
              const isSelected = letter === selected;
              let borderColor = 'var(--color-border)';
              let bg = 'var(--color-surface2)';
              let textColor = 'var(--color-text)';
              if (selected) {
                if (isCorrect) { borderColor = '#4ade80'; bg = 'rgba(74,222,128,0.08)'; }
                else if (isSelected) { borderColor = '#f87171'; bg = 'rgba(248,113,113,0.08)'; }
              }
              return (
                <motion.button
                  key={opt}
                  onClick={() => handleAnswer(letter)}
                  disabled={!!selected}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:cursor-default"
                  style={{ background: bg, border: `1px solid ${borderColor}`, color: textColor }}
                  whileHover={!selected ? { opacity: 0.85 } : {}}
                  whileTap={!selected ? { scale: 0.98 } : {}}
                >
                  {opt}
                  {selected && isCorrect && <span className="ml-2">✓</span>}
                  {selected && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                </motion.button>
              );
            })}
          </div>

          {selected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              <div className="rounded-xl px-4 py-3" style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>💡 {q.explanation}</p>
              </div>
              <motion.button
                onClick={handleNext}
                className="py-3 rounded-xl font-semibold text-white text-sm"
                style={{ background: 'var(--color-primary)' }}
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.97 }}
              >
                {current + 1 < questions.length ? 'Next Question →' : 'See My Score'}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizMode;
