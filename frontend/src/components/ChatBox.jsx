// ChatBox — the main chat screen where the child talks to EduBridge.
// V2 additions: tappable example questions, voice input (mic), and a star
// counter that celebrates every question the child asks.
import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { SUBJECT_THEMES } from '../subjectThemes';

// Set up the browser's speech-recognition engine once (if available)
const SpeechRecognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

const ChatBox = ({ subject, ageLevel, language, setLanguage, onBack }) => {
  const theme = SUBJECT_THEMES[subject];

  // Start the chat with a friendly subject-specific greeting
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I'm EduBridge 🌟 ${theme.greeting} What would you like to know?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState(0);        // one star per question asked
  const [celebrate, setCelebrate] = useState(false); // brief star "pop"
  const [listening, setListening] = useState(false); // mic is active
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Only show example chips before the child has asked anything
  const showExamples = messages.length === 1 && !loading;

  // Auto-scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Send a question to the backend and show Claude's answer.
  // Accepts optional text so example chips can send directly.
  const sendMessage = async (textArg) => {
    const userMessage = (textArg ?? input).trim();
    if (!userMessage || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    // Reward the child for asking — every question earns a star ⭐
    setStars(prev => prev + 1);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 900);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, subject, ageLevel, language })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (error) {
      // Friendly, non-scary error message for children
      setMessages(prev => [...prev, { role: 'assistant', text: 'Oops! Something went wrong. Please try again! 😊' }]);
    } finally {
      setLoading(false);
    }
  };

  // Start/stop voice input using the Web Speech API
  const toggleMic = () => {
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'telugu' ? 'te-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setInput(spoken); // drop it in the box so the child can review before sending
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFF]">

      {/* Top bar — back button, subject, star count, language toggle */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[#4F86C6] font-bold flex items-center gap-1 min-h-[48px] px-2"
        >
          ← Back
        </button>
        <span className="font-extrabold text-[#2D3748] text-lg">{theme.emoji} {subject}</span>
        <div className="flex items-center gap-2">
          {/* Star reward counter */}
          <span
            className={`flex items-center gap-1 bg-[#FFF3D1] text-[#2D3748] px-3 py-2 rounded-full text-sm font-extrabold transition-transform ${celebrate ? 'animate-starPop' : ''}`}
            title="Stars earned for asking questions"
          >
            ⭐ {stars}
          </span>
          <button
            onClick={() => setLanguage(language === 'english' ? 'telugu' : 'english')}
            className="flex items-center gap-1 bg-[#FFD166] text-[#2D3748] px-3 py-2 rounded-full text-sm font-bold hover:bg-yellow-400 transition-all min-h-[40px]"
          >
            {language === 'english' ? '🇮🇳 తెలుగు' : '🇺🇸 English'}
          </button>
        </div>
      </div>

      {/* Floating celebration message */}
      {celebrate && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-10 animate-floatUp">
          <span className="bg-white shadow-lg rounded-full px-4 py-2 text-sm font-extrabold text-[#4F86C6]">
            🎉 Great question! +1 ⭐
          </span>
        </div>
      )}

      {/* Messages area — scrolls independently */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-2xl w-full mx-auto">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} />
        ))}

        {/* Example question chips — only on a fresh chat */}
        {showExamples && (
          <div className="flex flex-col gap-2 animate-fadeIn">
            <p className="text-gray-400 text-sm font-bold ml-1">✨ Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {theme.examples.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className={`bg-white border-2 ${theme.border} ${theme.text} rounded-full px-4 py-2 text-sm font-bold shadow-sm hover:shadow-md active:scale-95 transition-all min-h-[40px]`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state — bouncing dots while Claude thinks */}
        {loading && (
          <div className="flex gap-2 items-center animate-fadeIn">
            <span className="text-2xl">🌟</span>
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — stays at the bottom */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 max-w-2xl w-full mx-auto">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={listening ? 'Listening… speak now! 🎤' : 'Ask me anything! 💬'}
          className="flex-1 border-2 border-[#4F86C6] rounded-full px-4 py-3 text-base outline-none focus:border-blue-600 text-[#2D3748] placeholder-gray-400 min-h-[48px]"
        />

        {/* Mic button — only shown when the browser supports speech recognition */}
        {SpeechRecognition && (
          <button
            onClick={toggleMic}
            aria-label={listening ? 'Stop listening' : 'Ask with your voice'}
            className={`px-4 py-3 rounded-full font-bold shadow-md active:scale-95 transition-all min-h-[48px] ${
              listening
                ? 'bg-[#FF6B6B] text-white animate-pulse'
                : 'bg-[#67C99A] text-white hover:bg-green-500'
            }`}
          >
            🎤
          </button>
        )}

        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-[#4F86C6] text-white px-5 py-3 rounded-full font-bold shadow-md hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          Send 🚀
        </button>
      </div>

    </div>
  );
};

export default ChatBox;
