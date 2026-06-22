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
import { AuthModal } from './components/AuthModal';
import QuizMode from './components/QuizMode';
import StudyPlan from './components/StudyPlan';
import { useAuth } from './contexts/AuthContext.jsx';
import { supabase } from './lib/supabase.js';
import { useXP } from './hooks/useXP';
import { useStats } from './hooks/useStats';
import { useBadges } from './hooks/useBadges';
import { useSound } from './hooks/useSound';
import { XP_REWARDS } from './data/levels';

function App() {
  const [subject, setSubject] = useState('Math');
  const [ageLevel, setAgeLevel] = useState('little');
  const [language, setLanguage] = useState('english');
  const [view, setView] = useState('welcome'); // 'welcome' | 'chat' | 'dashboard' | 'quiz'
  const [showAuth, setShowAuth] = useState(false);

  const { user, signOut } = useAuth();
  const { xp, level, levelData, nextLevelXP, addXP, showLevelUp, setShowLevelUp, setXPFromCloud } = useXP();
  const { stats, recordQuestion, setStatsFromCloud } = useStats();
  const { earned, locked, justUnlocked, clearUnlocked } = useBadges(stats);
  const { play, muted, toggleMute } = useSound();

  // Load cloud progress when user logs in, merge with local (take the higher value)
  useEffect(() => {
    if (!user || !supabase) return;
    supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setXPFromCloud(data.xp);
        setStatsFromCloud({
          totalQuestions: data.total_questions,
          streak: data.streak,
          lastSubject: data.last_subject,
          usedTelugu: data.used_telugu,
          learnedEarly: data.learned_early,
          bySubject: data.by_subject ?? {},
        });
      });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync progress to Supabase whenever XP or stats change (debounced 1.5s)
  useEffect(() => {
    if (!user || !supabase) return;
    const timer = setTimeout(() => {
      supabase.from('user_progress').upsert({
        user_id: user.id,
        xp,
        total_questions: stats.totalQuestions,
        streak: stats.streak,
        last_subject: stats.lastSubject,
        used_telugu: stats.usedTelugu,
        learned_early: stats.learnedEarly,
        by_subject: stats.bySubject,
        updated_at: new Date().toISOString(),
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [user?.id, xp, stats]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>

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
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
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
          user={user}
          onSignInClick={() => setShowAuth(true)}
          onSignOut={signOut}
        />

        <main className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {view === 'welcome' && (
              <motion.div
                key="welcome"
                className="flex flex-col items-center justify-start flex-1 px-4 py-8 gap-6 max-w-xl mx-auto w-full"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <div className="text-4xl mb-2">🌉</div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Welcome back</h2>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Choose a subject and start learning</p>
                </motion.div>

                <SubjectSelector subject={subject} setSubject={setSubject} />
                <AgeLevelSelector ageLevel={ageLevel} setAgeLevel={setAgeLevel} />

                <motion.button
                  onClick={() => setView('chat')}
                  className="w-full py-4 rounded-xl font-semibold text-white text-base"
                  style={{ background: 'var(--color-primary)' }}
                  whileHover={{ opacity: 0.9 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Start Learning
                </motion.button>

                <div className="w-full flex gap-3">
                  <motion.button
                    onClick={() => setView('quiz')}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: 'var(--color-surface2)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    whileHover={{ opacity: 0.8 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    🎯 Quick Quiz
                  </motion.button>
                  <motion.button
                    onClick={() => setView('dashboard')}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: 'var(--color-surface2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
                    whileHover={{ opacity: 0.8 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    📊 Dashboard
                  </motion.button>
                </div>

                <div className="w-full card p-4 flex flex-col gap-3">
                  <BadgeCollection earned={earned} locked={locked} />
                  {stats.totalQuestions >= 3 && (
                    <StudyPlan stats={stats} ageLevel={ageLevel} onSelectSubject={setSubject} />
                  )}
                </div>
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

            {view === 'quiz' && (
              <motion.div key="quiz" className="flex-1 flex flex-col min-h-0" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}>
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  <button onClick={() => setView('welcome')} className="font-medium text-sm min-h-[44px] px-2" style={{ color: 'var(--color-primary)' }}>← Back</button>
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Quick Quiz — {subject}</span>
                </div>
                <QuizMode subject={subject} ageLevel={ageLevel} onDone={() => setView('welcome')} playSound={play} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <LevelUpModal show={showLevelUp} level={level} levelData={levelData} onClose={() => setShowLevelUp(false)} />

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default App;
