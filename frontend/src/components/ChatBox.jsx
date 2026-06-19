// ChatBox — the main chat screen (V3 dark + gamified).
// Keeps every V2 feature: voice input, read-aloud, example chips, Telugu toggle.
// Adds: an animated mascot that reacts, confetti on each answer, and XP rewards.
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import Mascot from './Mascot';
import ConfettiEffect from './ConfettiEffect';
import { SUBJECT_THEMES } from '../subjectThemes';

const SpeechRecognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

const LANGUAGES = [
  { code: 'english',  label: 'English',  native: 'English',  flag: '🇺🇸', speech: 'en-US' },
  { code: 'hindi',    label: 'Hindi',    native: 'हिंदी',    flag: '🇮🇳', speech: 'hi-IN' },
  { code: 'telugu',   label: 'Telugu',   native: 'తెలుగు',   flag: '🇮🇳', speech: 'te-IN' },
  { code: 'tamil',    label: 'Tamil',    native: 'தமிழ்',    flag: '🇮🇳', speech: 'ta-IN' },
  { code: 'kannada',  label: 'Kannada',  native: 'ಕನ್ನಡ',   flag: '🇮🇳', speech: 'kn-IN' },
  { code: 'bengali',  label: 'Bengali',  native: 'বাংলা',    flag: '🇮🇳', speech: 'bn-IN' },
  { code: 'marathi',  label: 'Marathi',  native: 'मराठी',    flag: '🇮🇳', speech: 'mr-IN' },
];

const ChatBox = ({ subject, ageLevel, language, setLanguage, onBack, onQuestionAsked, playSound }) => {
  const theme = SUBJECT_THEMES[subject];

  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I'm EduBridge 🌟 ${theme.greeting} What would you like to know?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [mascotState, setMascotState] = useState('idle');
  const [answerConfetti, setAnswerConfetti] = useState(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  const showExamples = messages.length === 1 && !loading;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textArg) => {
    const userMessage = (textArg ?? input).trim();
    if (!userMessage || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);
    setMascotState('thinking');

    try {
      // Safety check before reaching the tutor
      const safetyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/safety-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, ageLevel }),
      }).catch(() => null);
      const safety = safetyRes?.ok ? await safetyRes.json() : { status: 'safe' };

      if (safety.status === 'distress') {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          text: "I hear you, and I'm really glad you told me. 💙 What you're feeling matters, and it is NOT your fault. Please talk to a trusted adult — a parent, teacher, or school counsellor — right away. You can also call Childline India FREE at 1098, any time, day or night. You are not alone, and help is there for you. 🌟"
        }]);
        setMascotState('idle');
        setLoading(false);
        return;
      }

      if (safety.status === 'inappropriate') {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          text: "Hmm, that's not something I can help with! 😊 But I'd love to teach you something amazing — ask me about Math, Science, English, or any of our subjects!"
        }]);
        setMascotState('idle');
        setLoading(false);
        return;
      }

      // Safe — reward the child and call the tutor
      onQuestionAsked?.({ subject, language });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, subject, ageLevel, language })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);

      // Celebrate the answer
      setMascotState('excited');
      setAnswerConfetti(Date.now());
      playSound?.('correct');
      setTimeout(() => setMascotState('idle'), 1800);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Oops! Something went wrong. Please try again! 😊' }]);
      setMascotState('idle');
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!SpeechRecognition) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = currentLang.speech;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ConfettiEffect trigger={answerConfetti} type="normal" />

      {/* Top bar */}
      <div className="bg-[#111827]/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-white/10">
        <button onClick={onBack} className="text-[#00D4FF] font-bold flex items-center gap-1 min-h-[48px] px-2">
          ← Back
        </button>
        <span className="font-black text-white text-lg">{theme.emoji} {subject}</span>
        <div className="relative">
          <button
            onClick={() => setShowLangPicker(p => !p)}
            className="flex items-center gap-1 bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] px-3 py-2 rounded-full text-sm font-bold hover:bg-[#FFD700]/25 transition-all min-h-[40px]"
          >
            {currentLang.flag} {currentLang.native}
          </button>
          {showLangPicker && (
            <div
              className="absolute right-0 top-12 z-50 rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.12)', minWidth: '160px' }}
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setShowLangPicker(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-left transition-all hover:bg-white/10"
                  style={{ color: lang.code === language ? '#FFD700' : '#9CA3AF' }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                  <span className="text-xs ml-auto opacity-60">{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mascot */}
      <div className="flex justify-center pt-4 pb-2">
        <Mascot state={mascotState} subject={subject} size="text-5xl" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-2xl w-full mx-auto">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} />
        ))}

        {showExamples && (
          <div className="flex flex-col gap-2 animate-fadeIn">
            <p className="text-[#9CA3AF] text-sm font-bold ml-1">✨ Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {theme.examples.map((q) => (
                <motion.button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full px-4 py-2 text-sm font-bold min-h-[40px]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${theme.color}`,
                    color: theme.color
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-2 items-center animate-fadeIn">
            <span className="text-2xl">🦉</span>
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#6C63FF] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#00D4FF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-[#111827]/80 backdrop-blur border-t border-white/10 px-4 py-3 flex gap-2 max-w-2xl w-full mx-auto">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={listening ? 'Listening… speak now! 🎤' : 'Ask me anything! 💬'}
          className="flex-1 rounded-full px-4 py-3 text-base outline-none min-h-[48px] text-white placeholder-[#9CA3AF]"
          style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid #6C63FF' }}
        />

        {SpeechRecognition && (
          <button
            onClick={toggleMic}
            aria-label={listening ? 'Stop listening' : 'Ask with your voice'}
            className={`px-4 py-3 rounded-full font-bold min-h-[48px] transition-all ${listening ? 'animate-pulse' : ''}`}
            style={{
              background: listening ? '#FF6B6B' : 'rgba(0,255,136,0.15)',
              border: '1.5px solid #00FF88',
              color: listening ? '#fff' : '#00FF88'
            }}
          >
            🎤
          </button>
        )}

        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="px-5 py-3 rounded-full font-black text-white min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', boxShadow: '0 0 18px rgba(108,99,255,0.5)' }}
        >
          Send 🚀
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
