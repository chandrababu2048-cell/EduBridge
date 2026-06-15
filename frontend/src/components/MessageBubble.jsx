// MessageBubble — one chat message; AI on the left, child on the right.
// AI messages get a "Listen" button that reads the answer aloud (great for
// young kids and early readers) using the browser's built-in speech synthesis.
import { useState, useEffect } from 'react';

const MessageBubble = ({ role, text }) => {
  const isAI = role === 'assistant';
  const [speaking, setSpeaking] = useState(false);

  // Is text-to-speech available in this browser?
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // If this bubble unmounts while talking, stop the voice
  useEffect(() => {
    return () => {
      if (ttsSupported && speaking) window.speechSynthesis.cancel();
    };
  }, [ttsSupported, speaking]);

  const toggleSpeak = () => {
    if (!ttsSupported) return;

    // If already speaking, stop
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Strip emojis so the voice doesn't read them out
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;      // a touch slower — easier for kids to follow
    utterance.pitch = 1.1;      // slightly higher — friendly
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel(); // stop anything else first
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className={`flex animate-fadeIn ${isAI ? 'justify-start' : 'justify-end'}`}>
      {isAI ? (
        // AI message — white bubble with star avatar, left aligned
        <div className="flex gap-2 max-w-[85%]">
          <span className="text-2xl">🌟</span>
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <p className="text-[#2D3748]">{text}</p>
            {ttsSupported && (
              <button
                onClick={toggleSpeak}
                className="mt-2 flex items-center gap-1 text-sm font-bold text-[#4F86C6] hover:text-blue-700 transition-colors min-h-[32px]"
                aria-label={speaking ? 'Stop reading aloud' : 'Read this answer aloud'}
              >
                {speaking ? '⏸️ Stop' : '🔊 Listen'}
              </button>
            )}
          </div>
        </div>
      ) : (
        // User message — blue bubble, right aligned
        <div className="bg-[#4F86C6] text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[75%] shadow-sm">
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
