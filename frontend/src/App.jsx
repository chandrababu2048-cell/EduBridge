// EduBridge App — welcome screen (pick subject + age), chat screen, and a staff stats view
import { useState } from 'react';
import Header from './components/Header';
import SubjectSelector from './components/SubjectSelector';
import AgeLevelSelector from './components/AgeLevelSelector';
import ChatBox from './components/ChatBox';
import Dashboard from './components/Dashboard';

function App() {
  const [subject, setSubject] = useState('Math');
  const [ageLevel, setAgeLevel] = useState('little');
  const [language, setLanguage] = useState('english');
  // view: 'welcome' | 'chat' | 'dashboard'
  const [view, setView] = useState('welcome');

  if (view === 'chat') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] font-nunito">
        <ChatBox
          subject={subject}
          ageLevel={ageLevel}
          language={language}
          setLanguage={setLanguage}
          onBack={() => setView('welcome')}
        />
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] font-nunito">
        <Dashboard onBack={() => setView('welcome')} />
      </div>
    );
  }

  // Welcome screen
  return (
    <div className="min-h-screen bg-[#F8FAFF] font-nunito">
      <Header />

      {/* Hero — warm welcome */}
      <div className="text-center py-8 px-4">
        <p className="text-4xl mb-2">✨</p>
        <h2 className="text-3xl font-extrabold text-[#2D3748] mb-1">Welcome! 👋</h2>
        <p className="text-gray-500 text-lg">What would you like to learn today?</p>
      </div>

      {/* Subject + age pickers and start button */}
      <div className="flex flex-col items-center justify-center px-4 gap-6 pb-6">
        <SubjectSelector subject={subject} setSubject={setSubject} />
        <AgeLevelSelector ageLevel={ageLevel} setAgeLevel={setAgeLevel} />
        <button
          onClick={() => setView('chat')}
          className="w-full max-w-sm bg-[#4F86C6] text-white py-4 px-8 rounded-full text-xl font-extrabold shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all active:scale-95 min-h-[48px]"
        >
          Start Learning! 🚀
        </button>
      </div>

      {/* Discreet staff link — for teachers/NGO, not children */}
      <div className="text-center pb-8">
        <button
          onClick={() => setView('dashboard')}
          className="text-gray-400 text-sm font-bold hover:text-[#4F86C6] transition-colors"
        >
          📊 For teachers: view usage stats
        </button>
      </div>
    </div>
  );
}

export default App;
