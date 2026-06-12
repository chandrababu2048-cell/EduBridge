// ChatBox — the main chat screen where the child talks to EduBridge
import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { SUBJECT_THEMES } from '../subjectThemes';

const ChatBox = ({ subject, ageLevel, language, setLanguage, onBack }) => {
  const theme = SUBJECT_THEMES[subject];

  // Start the chat with a friendly subject-specific greeting
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I'm EduBridge 🌟 ${theme.greeting} What would you like to know?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Send the child's question to the backend and show Claude's answer
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

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

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFF]">

      {/* Top bar — back button, subject, language toggle */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[#4F86C6] font-bold flex items-center gap-1 min-h-[48px] px-2"
        >
          ← Back
        </button>
        <span className="font-extrabold text-[#2D3748] text-lg">{theme.emoji} {subject}</span>
        <button
          onClick={() => setLanguage(language === 'english' ? 'telugu' : 'english')}
          className="flex items-center gap-1 bg-[#FFD166] text-[#2D3748] px-3 py-2 rounded-full text-sm font-bold hover:bg-yellow-400 transition-all min-h-[40px]"
        >
          {language === 'english' ? '🇮🇳 తెలుగు' : '🇺🇸 English'}
        </button>
      </div>

      {/* Messages area — scrolls independently */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-2xl w-full mx-auto">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} />
        ))}

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
          placeholder="Ask me anything! 💬"
          className="flex-1 border-2 border-[#4F86C6] rounded-full px-4 py-3 text-base outline-none focus:border-blue-600 text-[#2D3748] placeholder-gray-400 min-h-[48px]"
        />
        <button
          onClick={sendMessage}
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
