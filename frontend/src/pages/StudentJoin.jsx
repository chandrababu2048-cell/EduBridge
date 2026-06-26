/**
 * StudentJoin — student class join flow.
 * Route: /join
 *
 * Flow:
 *  1. Name step → ask for student's display name
 *  2. Auth step → email + password signup/signin (creates Supabase account)
 *  3. Code step → enter 6-char class code, look up class and join via class_members
 *  4. Success → navigate to /app
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const inputStyle = {
  background: 'var(--color-surface)',
  border: '1.5px solid var(--color-border)',
  color: 'var(--color-text)',
};

function getStudentName() {
  return localStorage.getItem('edubridge_student_name') ?? '';
}

export default function StudentJoin() {
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();

  const savedName = getStudentName();
  const [step, setStep] = useState(() => {
    if (user) return 'code';      // already logged in
    if (savedName) return 'auth'; // has name, needs auth
    return 'name';
  });

  const [nameInput, setNameInput] = useState(savedName);
  const [studentName, setStudentName] = useState(savedName);

  // Auth
  const [authMode, setAuthMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Code
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { class_name, teacher_name }

  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem('edubridge_student_name', trimmed);
    setStudentName(trimmed);
    setStep(user ? 'code' : 'auth');
  }

  async function handleAuth() {
    setAuthError('');
    if (!email.trim() || password.length < 6) {
      setAuthError('Enter a valid email and a password (min 6 characters).');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await signUp(email.trim(), password);
        if (error) throw error;
        // Save student profile in Supabase
        toast.success('Account created!');
        setStep('code');
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
        setStep('code');
      }
    } catch (err) {
      setAuthError(err.message ?? 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length !== 6) {
      setCodeError('Please enter the full 6-character code.');
      return;
    }
    if (!user || !supabase) {
      setCodeError('Please sign in first.');
      return;
    }
    setCodeError('');
    setLoading(true);
    try {
      // Look up the class by code
      const { data: cls, error: clsError } = await supabase
        .from('classes')
        .select('id, name, teacher_id, teacher_profiles(name)')
        .eq('class_code', trimmedCode)
        .eq('active', true)
        .maybeSingle();

      if (clsError) throw clsError;
      if (!cls) {
        setCodeError('Invalid code — ask your teacher for the right code.');
        return;
      }

      // Save/update student profile
      await supabase.from('student_profiles').upsert({
        user_id: user.id,
        name: studentName,
      });

      // Join the class (upsert to handle re-joins gracefully)
      const { error: joinError } = await supabase.from('class_members').upsert({
        class_id: cls.id,
        student_id: user.id,
      }, { onConflict: 'class_id,student_id' });

      if (joinError) throw joinError;

      const teacherName = cls.teacher_profiles?.name ?? 'Your Teacher';
      toast.success('You joined the class! 🎉');
      setSuccess({ class_name: cls.name, teacher_name: teacherName });
      setStep('success');
    } catch (err) {
      setCodeError(err.message ?? 'Could not connect. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌉</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Edu<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Free AI learning for every student</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <AnimatePresence mode="wait">

            {/* ── Step: name ── */}
            {step === 'name' && (
              <motion.div
                key="name"
                className="flex flex-col gap-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                <div>
                  <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    What's your name? 👋
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Your teacher will see this in the class roster.
                  </p>
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Priya"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  style={inputStyle}
                  maxLength={60}
                />
                <motion.button
                  onClick={handleNameSubmit}
                  disabled={!nameInput.trim()}
                  className="w-full py-3.5 rounded-xl font-semibold text-base"
                  style={{
                    background: nameInput.trim() ? 'var(--color-primary)' : 'var(--color-surface2)',
                    color: nameInput.trim() ? 'var(--color-primary-text)' : 'var(--color-muted)',
                  }}
                  whileTap={nameInput.trim() ? { scale: 0.97 } : {}}
                >
                  Continue →
                </motion.button>
              </motion.div>
            )}

            {/* ── Step: auth ── */}
            {step === 'auth' && (
              <motion.div
                key="auth"
                className="flex flex-col gap-5"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                <div>
                  <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Hi {studentName}! 👋
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Create a free account to save your progress.
                  </p>
                </div>

                <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  {['signup', 'signin'].map((m) => (
                    <button
                      key={m}
                      onClick={() => { setAuthMode(m); setAuthError(''); }}
                      className="flex-1 py-2.5 text-sm font-medium transition-colors"
                      style={{
                        background: authMode === m ? 'var(--color-primary)' : 'transparent',
                        color: authMode === m ? 'var(--color-primary-text)' : 'var(--color-muted)',
                      }}
                    >
                      {m === 'signup' ? 'New Student' : 'Sign In'}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="join-email" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Email</label>
                  <input
                    id="join-email"
                    autoFocus
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setAuthError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="join-password" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Password</label>
                  <input
                    id="join-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={inputStyle}
                  />
                </div>

                {authError && (
                  <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#FFF3CD', color: '#856404' }}>
                    ⚠️ {authError}
                  </p>
                )}

                <motion.button
                  onClick={handleAuth}
                  disabled={!email.trim() || password.length < 6 || loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-base"
                  style={{
                    background: email.trim() && password.length >= 6 ? 'var(--color-primary)' : 'var(--color-surface2)',
                    color: email.trim() && password.length >= 6 ? 'var(--color-primary-text)' : 'var(--color-muted)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? 'Please wait…' : authMode === 'signup' ? 'Create Account →' : 'Sign In →'}
                </motion.button>

                <button
                  onClick={() => setStep('name')}
                  className="text-xs text-center"
                  style={{ color: 'var(--color-muted)' }}
                >
                  ← Change name
                </button>
              </motion.div>
            )}

            {/* ── Step: code ── */}
            {step === 'code' && (
              <motion.div
                key="code"
                className="flex flex-col gap-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Join your class
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Enter the 6-letter code your teacher gave you.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="ABC123"
                    value={code}
                    maxLength={6}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                      setCodeError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    className="w-full px-6 py-4 rounded-xl text-center font-black text-3xl tracking-[0.3em] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] uppercase"
                    style={{ ...inputStyle, caretColor: 'var(--color-primary)' }}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <div className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
                    {code.length}/6 characters
                  </div>
                </div>

                <AnimatePresence>
                  {codeError && (
                    <motion.div
                      className="rounded-xl px-4 py-3 text-sm font-medium"
                      style={{ background: '#FFF3CD', color: '#856404', border: '1px solid #FFEAA7' }}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      ⚠️ {codeError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleJoin}
                  disabled={code.length !== 6 || loading}
                  className="w-full py-4 rounded-xl font-bold text-base"
                  style={{
                    background: code.length === 6 ? 'var(--color-primary)' : 'var(--color-surface2)',
                    color: code.length === 6 ? 'var(--color-primary-text)' : 'var(--color-muted)',
                    cursor: code.length === 6 && !loading ? 'pointer' : 'not-allowed',
                  }}
                  whileTap={code.length === 6 ? { scale: 0.97 } : {}}
                >
                  {loading ? 'Joining…' : 'Join Class →'}
                </motion.button>
              </motion.div>
            )}

            {/* ── Step: success ── */}
            {step === 'success' && success && (
              <motion.div
                key="success"
                className="flex flex-col items-center gap-5 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl">🎉</div>
                <div>
                  <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Welcome to {success.class_name}!
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Your teacher is <strong style={{ color: 'var(--color-text)' }}>{success.teacher_name}</strong>.
                    You're all set to start learning.
                  </p>
                </div>
                <div
                  className="w-full rounded-2xl px-4 py-4 text-sm"
                  style={{ background: 'var(--color-surface2)', color: 'var(--color-muted)' }}
                >
                  Signed in as <strong style={{ color: 'var(--color-text)' }}>{studentName}</strong>
                </div>
                <motion.button
                  onClick={() => navigate('/app')}
                  className="w-full py-4 rounded-xl font-bold text-base"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
                  whileHover={{ opacity: 0.88 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Learning →
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs"
            style={{ color: 'var(--color-muted)' }}
          >
            ← Back to home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
