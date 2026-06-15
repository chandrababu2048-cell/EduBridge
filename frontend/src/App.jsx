// EduBridge V3 — gamified dark-theme learning adventure.
// Welcome → Chat → (teacher) Dashboard, with XP, levels, badges, and sound.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import SubjectSelector from './components/SubjectSelector';
import AgeLevelSelector from './components/AgeLevelSelector';
import ChatBox from './components/ChatBox';
import Dashboard from './components/Dashboard';
import StarBackground from './components/StarBackground';
import LevelUpModal from './components/LevelUpModal';
import BadgeCollection from './components/BadgeCollection';
import ConfettiEffect from './components/ConfettiEffect';
import { useXP } from './hooks/useXP';
import { useStats } from './hooks/useStats';
import { useBadges } from './hooks/useBadges';
import { useSound } from './hooks/useSound';
import { XP_REWARDS } from './data/levels';

function App() {
  const [subject, setSubject] = useState('Math');
  const [ageLevel, setAgeLevel] = useState('little');
  const [language, setLanguage] = useState('english');
  const [view, setView] = useState('welcome'); // 'welcome' | 'chat' | 'dashboard'

  const { xp, level, levelData, nextLevelXP, addXP, showLevelUp, setShowLevelUp } = useXP();
  const { stats, recordQuestion } = useStats();
  const { earned, locked, justUnlocked, clearUnlocked } = useBadges(stats);
  const { play, muted, toggleMute } = useSound();

  // Award XP + record stats whenever a question is asked
  const handleQuestionAsked = ({ subject, language }) => {
    const isFirst = stats.totalQuestions === 0;
    recordQuestion({ subject, language });
    addXP(isFirst ? XP_REWARDS.firstQuestion : XP_REWARDS.eachQuestion);
    play('xpGain');
  };

  // Sound on level-up
  useEffect(() => {
    if (showLevelUp) play('levelUp');
  }, [showLevelUp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sound + auto-dismiss for badge unlock
  useEffect(() => {
    if (!justUnlocked) return;
    play('badge');
    const t = setTimeout(clearUnlocked, 3500);
    return () => clearTimeout(t);
  }, [justUnlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen relative overflow-hidden bg-animated">
      <StarBackground />

      {/* Badge unlock celebration */}
      <ConfettiEffect trigger={justUnlocked?.id ?? null} type="badge" />
      <AnimatePresence>
        {justUnlocked && (
          <motion.div
            className="fixed top-24 left-1/2 z-50 pointer-events-none"
            initial={{ opacity: 0, y: 20, x: '-50%', scale: 0.8 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{ background: '#111827', border: '1px solid rgba(255,215,0,0.5)', boxShadow: '0 0 30px rgba(255,215,0,0.35)' }}
            >
              <span className="text-3xl">{justUnlocked.emoji}</span>
              <div>
                <p className="text-[#FFD700] font-black text-sm uppercase tracking-wide">Badge Unlocked!</p>
                <p className="text-white font-bold">{justUnlocked.name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header
          xp={xp}
          level={level}
          levelData={levelData}
          nextLevelXP={nextLevelXP}
          muted={muted}
          onToggleMute={toggleMute}
        />

        <main className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {view === 'welcome' && (
              <motion.div
                key="welcome"
                className="flex flex-col items-center justify-start flex-1 p-6 gap-7"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <motion.div className="text-center mt-2" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <motion.div
                    className="text-6xl mb-3"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🌉
                  </motion.div>
                  <h2 className="text-3xl font-black text-white mb-1">Welcome back! 👋</h2>
                  <p className="text-[#9CA3AF]">Your AI Learning Adventure awaits 🚀</p>
                </motion.div>

                <SubjectSelector subject={subject} setSubject={setSubject} />
                <AgeLevelSelector ageLevel={ageLevel} setAgeLevel={setAgeLevel} />

                <motion.button
                  onClick={() => setView('chat')}
                  className="px-10 py-5 rounded-2xl font-black text-white text-xl relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', boxShadow: '0 0 30px rgba(108, 99, 255, 0.5)' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(108, 99, 255, 0.8)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    style={{ background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  Start Learning! 🎮
                </motion.button>

                {/* Badge collection */}
                <div className="w-full max-w-md mt-2 glass p-5">
                  <BadgeCollection earned={earned} locked={locked} />
                </div>

                {/* Teacher link */}
                <button
                  onClick={() => setView('dashboard')}
                  className="text-[#9CA3AF] text-sm font-bold hover:text-[#00D4FF] transition-colors"
                >
                  📊 For teachers: view usage stats
                </button>
              </motion.div>
            )}

            {view === 'chat' && (
              <motion.div
                key="chat"
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
              >
                <ChatBox
                  subject={subject}
                  ageLevel={ageLevel}
                  language={language}
                  setLanguage={setLanguage}
                  onBack={() => setView('welcome')}
                  onQuestionAsked={handleQuestionAsked}
                  playSound={play}
                />
              </motion.div>
            )}

            {view === 'dashboard' && (
              <motion.div key="dashboard" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Dashboard onBack={() => setView('welcome')} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <LevelUpModal show={showLevelUp} level={level} levelData={levelData} onClose={() => setShowLevelUp(false)} />
    </div>
  );
}

export default App;
