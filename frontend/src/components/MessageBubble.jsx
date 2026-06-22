import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ role, text }) => {
  const isAI = role === 'assistant';
  const [speaking, setSpeaking] = useState(false);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    return () => { if (ttsSupported && speaking) window.speechSynthesis.cancel(); };
  }, [ttsSupported, speaking]);

  const toggleSpeak = () => {
    if (!ttsSupported) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <motion.div
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isAI ? (
        <div className="flex gap-2 max-w-[85%]">
          <span className="text-xl mt-1">🦉</span>
          <div className="rounded-2xl rounded-tl-none px-4 py-3" style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}>
            <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>{text}</p>
            {ttsSupported && (
              <button
                onClick={toggleSpeak}
                className="mt-2 text-xs font-medium transition-colors"
                style={{ color: speaking ? 'var(--color-primary)' : 'var(--color-muted)' }}
              >
                {speaking ? '⏸ Stop' : '🔊 Listen'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl rounded-tr-none px-4 py-3 max-w-[75%]"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
        >
          <p>{text}</p>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
