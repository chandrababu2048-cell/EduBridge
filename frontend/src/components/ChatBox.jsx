// ChatBox — the main chat screen (V3 dark + gamified).
// Keeps every V2 feature: voice input, read-aloud, example chips, Telugu toggle.
// Adds: an animated mascot that reacts, confetti on each answer, and XP rewards.
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import Mascot from './Mascot';
import ConfettiEffect from './ConfettiEffect';
import { SUBJECT_THEMES } from '../subjectThemes';
import { getChapters } from '../data/ncert.js';

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

const ChatBox = ({ subject, ageLevel, grade, chapter, language, setLanguage, onBack, onQuestionAsked, playSound }) => {
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
  const mascotTimerRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  const showExamples = messages.length === 1 && !loading;

  // Clear any pending mascot timer when the component unmounts
  useEffect(() => {
    return () => {
      if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current);
    };
  }, []);

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
        body: JSON.stringify({
            message: userMessage, subject, ageLevel, grade, language,
            chapterName: chapter !== null ? getChapters(subject, grade)[chapter] ?? null : null,
            chapterIndex: chapter !== null ? chapter + 1 : null,
          })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);

      // Celebrate the answer
      setMascotState('excited');
      setAnswerConfetti(Date.now());
      playSound?.('correct');
      if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current);
      mascotTimerRef.current = setTimeout(() => setMascotState('idle'), 1800);
    } catch (error) {
      const offlineMsg = !navigator.onLine
        ? "You're offline right now. 📡 Please check your internet connection and try again!"
        : 'Oops! Something went wrong. Please try again! 😊';
      setMessages((prev) => [...prev, { role: 'assistant', text: offlineMsg }]);
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
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={onBack}
          className="font-medium flex items-center gap-1 min-h-[44px] px-2 text-sm transition-colors"
          style={{ color: 'var(--color-primary)' }}
        >
          ← Back
        </button>
        <span className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>{theme.emoji} {subject}</span>
        <div className="relative">
          <button
            onClick={() => setShowLangPicker(p => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
            style={{ color: 'var(--color-text)', border: '1px solid var(--color-border)', background: 'var(--color-surface2)' }}
          >
            {currentLang.flag} {currentLang.native}
          </button>
          {showLangPicker && (
            <div
              className="absolute right-0 top-10 z-50 rounded-xl overflow-hidden shadow-xl"
              style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)', minWidth: '160px' }}
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setShowLangPicker(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{ color: lang.code === language ? 'var(--color-primary)' : 'var(--color-muted)', fontWeight: lang.code === language ? 600 : 400 }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                  <span className="text-xs ml-auto opacity-50">{lang.label}</span>
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
          <div className="flex flex-col gap-2">
            <p className="text-sm ml-1 font-medium" style={{ color: 'var(--color-muted)' }}>Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {theme.examples.map((q) => (
                <motion.button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium min-h-[44px] transition-colors"
                  style={{
                    background: 'var(--color-surface2)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-2 items-center">
            <span className="text-xl">🦉</span>
            <div className="rounded-2xl rounded-tl-none px-4 py-3" style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--color-muted)' }}></span>
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--color-muted)', animationDelay: '0.15s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--color-muted)', animationDelay: '0.3s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 pt-3 flex gap-2 max-w-2xl w-full mx-auto" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={listening ? 'Listening…' : 'Ask me anything…'}
          className="flex-1 rounded-xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] min-h-[44px] transition-colors"
          style={{
            background: 'var(--color-surface2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />

        {SpeechRecognition && (
          <button
            onClick={toggleMic}
            aria-label={listening ? 'Stop listening' : 'Ask with your voice'}
            className={`px-3 py-2 rounded-xl min-h-[44px] transition-all ${listening ? 'animate-pulse' : ''}`}
            style={{
              background: listening ? 'rgba(212,119,74,0.2)' : 'var(--color-surface2)',
              border: '1px solid var(--color-border)',
              color: listening ? 'var(--color-primary)' : 'var(--color-muted)',
            }}
          >
            🎤
          </button>
        )}

        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="px-4 py-2 rounded-xl font-semibold text-sm min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
