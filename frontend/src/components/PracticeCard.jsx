// PracticeCard — "🎯 Quick check!" (doubt-to-mastery).
// After the tutor explains a concept, this card shows 2 auto-generated
// multiple-choice questions so the child can prove they learned it.
//
// Flow: one question at a time. Correct → celebrate and advance; wrong →
// gentle shake + "Try again!" (retries allowed, but mastery requires getting
// BOTH questions right on the FIRST attempt). It lives in the chat scroll
// history and never blocks further chatting.
import { useState } from 'react';
import { motion } from 'framer-motion';
import ConfettiEffect from './ConfettiEffect';

const PracticeCard = ({ questions, subject, onMastery, playSound }) => {
  const [current, setCurrent] = useState(0);          // which question is active
  const [correctPick, setCorrectPick] = useState(null); // option just answered correctly (brief highlight)
  const [wrongPick, setWrongPick] = useState(null);   // option just answered wrongly (shake + tint)
  const [hadWrong, setHadWrong] = useState(false);    // any wrong attempt anywhere → no mastery
  const [done, setDone] = useState(null);             // null | 'mastered' | 'practiced'
  const [confetti, setConfetti] = useState(null);

  const question = questions[current];

  const handlePick = (index) => {
    // Ignore taps while celebrating a correct answer or after completion
    if (done || correctPick !== null || !question) return;

    if (index === question.correctIndex) {
      playSound?.('correct');
      setCorrectPick(index);
      setWrongPick(null);
      const isLast = current >= questions.length - 1;
      // Short pause so the child sees the green highlight before moving on
      setTimeout(() => {
        setCorrectPick(null);
        if (!isLast) {
          setCurrent((c) => c + 1);
          return;
        }
        // All questions answered — mastery only if every first attempt was right
        if (!hadWrong) {
          setDone('mastered');
          setConfetti(Date.now());
          onMastery?.({ subject });
        } else {
          setDone('practiced');
        }
      }, 700);
    } else {
      setWrongPick(index);
      setHadWrong(true);
    }
  };

  return (
    <div
      className="rounded-2xl p-4 w-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      data-testid="practice-card"
    >
      <ConfettiEffect trigger={confetti} type="normal" />

      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>🎯 Quick check!</p>
        {!done && (
          <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
            Question {current + 1} of {questions.length}
          </span>
        )}
      </div>

      {done === 'mastered' && (
        <div className="text-center py-3">
          <p className="text-2xl mb-1">⭐</p>
          <p className="font-bold" style={{ color: 'var(--color-primary)' }}>Mastered!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            You got every question right on the first try. +25 XP!
          </p>
        </div>
      )}

      {done === 'practiced' && (
        <div className="text-center py-3">
          <p className="text-2xl mb-1">💪</p>
          <p className="font-bold" style={{ color: 'var(--color-text)' }}>Great practice!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            You worked it out — keep going, you're learning!
          </p>
        </div>
      )}

      {!done && question && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            {question.question}
          </p>

          {question.options.map((option, i) => {
            const isCorrectPick = correctPick === i;
            const isWrongPick = wrongPick === i;
            return (
              <motion.button
                key={`${current}-${i}`}
                onClick={() => handlePick(i)}
                // Gentle shake on a wrong pick; the key resets it per attempt
                animate={isWrongPick ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium min-h-[44px] transition-colors"
                style={{
                  background: isCorrectPick
                    ? 'var(--color-primary)'
                    : isWrongPick
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'var(--color-surface2)',
                  border: isWrongPick
                    ? '1px solid rgba(239, 68, 68, 0.5)'
                    : '1px solid var(--color-border)',
                  color: isCorrectPick ? 'var(--color-primary-text)' : 'var(--color-text)',
                }}
              >
                {option}
              </motion.button>
            );
          })}

          {wrongPick !== null && (
            <p className="text-xs font-medium mt-1" style={{ color: 'var(--color-muted)' }}>
              Not quite — try again! 😊
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeCard;
