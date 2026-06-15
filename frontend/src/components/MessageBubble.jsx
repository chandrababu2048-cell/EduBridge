// MessageBubble — one chat message, dark theme. AI on the left (with a
// "Listen" read-aloud button), child on the right.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ role, text }) => {
  const isAI = role === 'assistant';
  const [speaking, setSpeaking] = useState(false);

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    return () => {
      if (ttsSupported && speaking) window.speechSynthesis.cancel();
    };
  }, [ttsSupported, speaking]);

  const toggleSpeak = () => {
    if (!ttsSupported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <motion.div
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {isAI ? (
        <div className="flex gap-2 max-w-[85%]">
          <span className="text-2xl">🦉</span>
          <div
            className="rounded-2xl rounded-tl-none px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-[#F9FAFB] leading-relaxed">{text}</p>
            {ttsSupported && (
              <button
                onClick={toggleSpeak}
                className="mt-2 flex items-center gap-1 text-sm font-bold text-[#00D4FF] hover:text-cyan-300 transition-colors min-h-[32px]"
                aria-label={speaking ? 'Stop reading aloud' : 'Read this answer aloud'}
              >
                {speaking ? '⏸️ Stop' : '🔊 Listen'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl rounded-tr-none px-4 py-3 max-w-[75%] text-white font-medium"
          style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', boxShadow: '0 0 16px rgba(108,99,255,0.35)' }}
        >
          <p>{text}</p>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
