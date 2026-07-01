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
  const fileInputRef = useRef(null);

  // Photo-a-problem: a pending photo waiting to be sent with the next message.
  // { dataUrl (for the preview + bubble thumbnail), base64 (payload), mediaType }
  const [pendingImage, setPendingImage] = useState(null);

  // Conversation memory sent to the tutor so "explain that again" works.
  // Only REAL user↔tutor exchanges go in here (updated on successful replies),
  // so the greeting, canned distress/inappropriate responses, and error
  // messages are excluded by construction. Capped to the last 10 messages
  // (5 exchanges) to protect API costs.
  const MAX_HISTORY = 10;
  const historyRef = useRef([]);

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

  // Photo-a-problem: validate and stage a photo of a textbook/homework problem.
  // Client cap is 3MB binary — Vercel serverless rejects bodies over ~4.5MB and
  // base64 inflates by 4/3, so 3MB binary ≈ 4.1MB base64 stays safely under it.
  const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file after remove
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'I can only read JPG, PNG, or WebP photos! 📷 Try taking a photo with your camera.' }]);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setMessages((prev) => [...prev, { role: 'assistant', text: "That photo is too big! 📷 Try a smaller one, or take the photo again a bit further from the page." }]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      // Strip the "data:image/…;base64," prefix — the API wants raw base64.
      const base64 = String(dataUrl).split(',')[1] ?? '';
      setPendingImage({ dataUrl, base64, mediaType: file.type });
    };
    reader.onerror = () => {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Hmm, I couldn't read that photo. 📷 Please try again!" }]);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (textArg) => {
    // A photo may be sent alone — the tutor gets a default question with it.
    const typedMessage = (textArg ?? input).trim();
    const image = pendingImage;
    if ((!typedMessage && !image) || loading) return;
    const userMessage = typedMessage || 'Can you explain this problem to me?';

    setInput('');
    setPendingImage(null);
    setMessages((prev) => [...prev, { role: 'user', text: userMessage, imageUrl: image?.dataUrl }]);
    setLoading(true);
    setMascotState('thinking');

    try {
      // Safety check before reaching the tutor. Note: the pre-screen sees only
      // the TEXT — attached photos are not screened (the tutor system prompt
      // constrains responses regardless, and photos are of textbook problems).
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
            // Previous real exchanges (excludes greeting/canned/error messages
            // and the just-sent message — see historyRef above).
            history: historyRef.current,
            // Photo-a-problem: raw base64 (no data: prefix) + media type.
            // Images never go into history — text answers carry the context.
            ...(image ? { image: { data: image.base64, mediaType: image.mediaType } } : {}),
          })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      // Remember this successful exchange for the next question
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', text: userMessage },
        { role: 'assistant', text: data.reply },
      ].slice(-MAX_HISTORY);
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
          <MessageBubble key={i} role={msg.role} text={msg.text} imageUrl={msg.imageUrl} />
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

      {/* Pending photo preview */}
      {pendingImage && (
        <div className="px-4 pt-2 max-w-2xl w-full mx-auto" style={{ background: 'var(--color-surface)' }}>
          <div className="inline-flex items-center gap-2 rounded-xl p-1.5" style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}>
            <img
              src={pendingImage.dataUrl}
              alt="photo of the problem, ready to send"
              className="rounded-lg object-cover"
              style={{ height: 56, width: 56 }}
            />
            <span className="text-xs font-medium pr-1" style={{ color: 'var(--color-muted)' }}>Photo ready 📸</span>
            <button
              onClick={() => setPendingImage(null)}
              aria-label="Remove photo"
              className="rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
              style={{ minWidth: 44, minHeight: 44, color: 'var(--color-muted)' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

        {/* Photo-a-problem: hidden file input + camera button.
            capture="environment" opens the rear camera on phones;
            on desktop it falls back to a normal file picker. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handlePhotoPick}
          className="hidden"
          data-testid="photo-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Send a photo of your problem"
          className="px-3 py-2 rounded-xl min-h-[44px] transition-all"
          style={{
            background: pendingImage ? 'rgba(2,216,233,0.15)' : 'var(--color-surface2)',
            border: '1px solid var(--color-border)',
            color: pendingImage ? 'var(--color-primary)' : 'var(--color-muted)',
          }}
        >
          📷
        </button>

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
