# SKILL.md — EduBridge Technical Skills & Patterns

-----

## 🎯 PROJECT CONTEXT

EduBridge is a child-friendly AI tutoring app.
Stack: React + Vite + Tailwind (frontend) | Node.js + Express + Claude API (backend)
Audience: Children aged 6-14, non-technical users, low-resource environments

-----

## 🎨 DESIGN TOKENS

```
PRIMARY:     #4F86C6  (friendly blue)
SECONDARY:   #67C99A  (fresh green)
ACCENT:      #FFD166  (warm yellow)
BACKGROUND:  #F8FAFF  (soft white)
TEXT:        #2D3748  (dark readable)
ERROR:       #FC8181  (soft red)
WHITE:       #FFFFFF

FONT:        'Nunito', sans-serif
HEADING:     font-bold text-2xl md:text-3xl
BODY:        font-normal text-base
SMALL:       text-sm text-gray-500

RADIUS:      rounded-2xl (cards) rounded-full (buttons)
SHADOW:      shadow-md hover:shadow-lg
SPACING:     p-4 md:p-6 gap-4
```

-----

## 📁 FILE PATTERNS

### Backend — server.js

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', chatRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Backend — routes/chat.js

```javascript
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from '../prompts/systemPrompts.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/chat', async (req, res) => {
  try {
    const { message, subject, ageLevel, language } = req.body;
    const systemPrompt = getSystemPrompt(subject, ageLevel, language);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    res.json({ reply: response.content[0].text });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router;
```

### Backend — prompts/systemPrompts.js

```javascript
export const getSystemPrompt = (subject, ageLevel, language) => {
  const age = ageLevel === 'little' ? '6 to 10 years old' : '11 to 14 years old';
  const lang = language === 'telugu' ? 'Telugu and English mixed simply' : 'simple English';

  return `You are EduBridge — a kind, patient, and encouraging AI tutor for children aged ${age}.

Your job is to explain ${subject} concepts in ${lang} that a child can easily understand.

Rules you must follow:
- Use very simple words — no complex vocabulary
- Use fun examples from everyday life (food, animals, games, family)
- Keep answers short — maximum 4-5 sentences
- Always be encouraging and positive
- If the child seems confused, offer to explain differently
- Never make the child feel bad for not knowing something
- Use emojis occasionally to make learning fun 🌟
- End every answer with an encouraging phrase

You are like a kind older brother or sister who loves helping kids learn.`;
};
```

### Frontend — App.jsx

```jsx
import { useState } from 'react';
import Header from './components/Header';
import SubjectSelector from './components/SubjectSelector';
import AgeLevelSelector from './components/AgeLevelSelector';
import ChatBox from './components/ChatBox';

function App() {
  const [subject, setSubject] = useState('Math');
  const [ageLevel, setAgeLevel] = useState('little');
  const [language, setLanguage] = useState('english');
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-nunito">
      <Header />
      {!started ? (
        <div className="flex flex-col items-center justify-center p-6 gap-6">
          <SubjectSelector subject={subject} setSubject={setSubject} />
          <AgeLevelSelector ageLevel={ageLevel} setAgeLevel={setAgeLevel} />
          <button
            onClick={() => setStarted(true)}
            className="bg-[#4F86C6] text-white px-8 py-4 rounded-full text-lg font-bold shadow-md hover:shadow-lg hover:bg-blue-600 transition-all"
          >
            Start Learning! 🚀
          </button>
        </div>
      ) : (
        <ChatBox
          subject={subject}
          ageLevel={ageLevel}
          language={language}
          setLanguage={setLanguage}
          onBack={() => setStarted(false)}
        />
      )}
    </div>
  );
}

export default App;
```

### Frontend — components/ChatBox.jsx

```jsx
import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatBox = ({ subject, ageLevel, language, setLanguage, onBack }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I'm EduBridge 🌟 I'm here to help you learn ${subject}! What would you like to know?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

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

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Oops! Something went wrong. Please try again! 😊' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-2xl mx-auto p-4">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-[#4F86C6] font-bold">← Back</button>
        <span className="font-bold text-[#2D3748]">📚 {subject}</span>
        <button
          onClick={() => setLanguage(language === 'english' ? 'telugu' : 'english')}
          className="text-sm bg-[#FFD166] px-3 py-1 rounded-full font-bold"
        >
          {language === 'english' ? 'తెలుగు' : 'English'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} />
        ))}
        {loading && (
          <div className="flex gap-1 p-3">
            <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce delay-100" />
            <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce delay-200" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything! 💬"
          className="flex-1 border-2 border-[#4F86C6] rounded-full px-4 py-3 outline-none focus:border-blue-600"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-[#4F86C6] text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 disabled:opacity-50"
        >
          Send 🚀
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
```

### Frontend — components/MessageBubble.jsx

```jsx
const MessageBubble = ({ role, text }) => {
  const isAI = role === 'assistant';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[#2D3748] shadow-sm
        ${isAI ? 'bg-white border border-gray-100' : 'bg-[#4F86C6] text-white'}`}>
        {isAI && <span className="text-lg mr-2">🌟</span>}
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;
```

### Frontend — components/SubjectSelector.jsx

```jsx
const subjects = [
  { name: 'Math', emoji: '🔢' },
  { name: 'Science', emoji: '🔬' },
  { name: 'English', emoji: '📖' }
];

const SubjectSelector = ({ subject, setSubject }) => (
  <div className="w-full max-w-md">
    <h2 className="text-xl font-bold text-center text-[#2D3748] mb-3">
      What would you like to learn? 📚
    </h2>
    <div className="flex gap-3 justify-center">
      {subjects.map(s => (
        <button
          key={s.name}
          onClick={() => setSubject(s.name)}
          className={`flex flex-col items-center p-4 rounded-2xl border-2 font-bold transition-all
            ${subject === s.name
              ? 'border-[#4F86C6] bg-[#4F86C6] text-white shadow-lg scale-105'
              : 'border-gray-200 bg-white text-[#2D3748] hover:border-[#4F86C6]'
            }`}
        >
          <span className="text-3xl mb-1">{s.emoji}</span>
          <span>{s.name}</span>
        </button>
      ))}
    </div>
  </div>
);

export default SubjectSelector;
```

### Frontend — components/AgeLevelSelector.jsx

```jsx
const AgeLevelSelector = ({ ageLevel, setAgeLevel }) => (
  <div className="w-full max-w-md">
    <h2 className="text-xl font-bold text-center text-[#2D3748] mb-3">
      How old are you? 🎂
    </h2>
    <div className="flex gap-3 justify-center">
      {[
        { value: 'little', label: 'Little Kids', age: '6-10', emoji: '🐣' },
        { value: 'older', label: 'Older Kids', age: '11-14', emoji: '🦋' }
      ].map(level => (
        <button
          key={level.value}
          onClick={() => setAgeLevel(level.value)}
          className={`flex flex-col items-center p-4 rounded-2xl border-2 font-bold transition-all
            ${ageLevel === level.value
              ? 'border-[#67C99A] bg-[#67C99A] text-white shadow-lg scale-105'
              : 'border-gray-200 bg-white text-[#2D3748] hover:border-[#67C99A]'
            }`}
        >
          <span className="text-3xl mb-1">{level.emoji}</span>
          <span>{level.label}</span>
          <span className="text-sm opacity-75">{level.age} years</span>
        </button>
      ))}
    </div>
  </div>
);

export default AgeLevelSelector;
```

### Frontend — components/Header.jsx

```jsx
const Header = () => (
  <header className="bg-white shadow-sm py-4 px-6 flex items-center gap-3 mb-6">
    <span className="text-3xl">🌉</span>
    <div>
      <h1 className="text-2xl font-bold text-[#4F86C6]">EduBridge</h1>
      <p className="text-sm text-gray-500">Free AI Tutor for Every Child</p>
    </div>
  </header>
);

export default Header;
```

-----

## ⚙️ PACKAGE.JSON FILES

### Backend — package.json

```json
{
  "name": "edubridge-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Frontend — package.json

```json
{
  "name": "edubridge-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.0"
  }
}
```

-----

## 🌍 ENVIRONMENT VARIABLES

### Backend — .env

```
ANTHROPIC_API_KEY=your_claude_api_key_here
PORT=3001
```

### Frontend — .env

```
VITE_API_URL=http://localhost:3001
```

-----

## 📖 README TEMPLATE

```markdown
# 🌉 EduBridge — Free AI Tutor for Every Child

EduBridge is a free, open-source AI tutoring app that gives underprivileged children access to patient, personalized explanations of Math, Science, and English — powered by Claude AI.

## ✨ Features
- 📚 Three subjects: Math, Science, English
- 🎂 Two age levels: Little Kids (6-10) & Older Kids (11-14)
- 🌍 English & Telugu language support
- 💬 Real-time AI chat powered by Claude
- 📱 Mobile friendly

## 🚀 Live Demo
[Coming soon]

## 🛠️ Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- AI: Anthropic Claude API

## 🏃 Run Locally

### Backend
cd backend
npm install
cp .env.example .env  # add your Claude API key
npm run dev

### Frontend
cd frontend
npm install
npm run dev

## 💙 Why I Built This
I spent years teaching orphaned children in India with zero resources. EduBridge is my way of giving every child access to a patient, kind tutor — for free, forever.

Built by Chandrababu Anakapalli for the Anthropic Claude Corps Fellowship.
```