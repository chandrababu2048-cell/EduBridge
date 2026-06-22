/**
 * StudentJoin — student class join flow.
 * Route: /join
 *
 * Flow:
 *  1. If student name not set → ask for name
 *  2. Enter 6-char class code (auto-uppercase)
 *  3. POST /api/student/join → success screen → /app
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL ?? '';

function getOrCreateStudentId() {
  let id = localStorage.getItem('edubridge_student_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('edubridge_student_id', id);
  }
  return id;
}

function getStudentName() {
  return localStorage.getItem('edubridge_student_name') ?? '';
}

function saveStudentName(name) {
  localStorage.setItem('edubridge_student_name', name);
}

const inputStyle = {
  background: 'var(--color-surface)',
  border: '1.5px solid var(--color-border)',
  color: 'var(--color-text)',
};

export default function StudentJoin() {
  const navigate = useNavigate();

  const [step, setStep] = useState(() => getStudentName() ? 'code' : 'name');
  const [studentName, setStudentName] = useState(getStudentName);
  const [nameInput, setNameInput] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { class_name, teacher_name }

  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    saveStudentName(trimmed);
    setStudentName(trimmed);
    setStep('code');
  }

  async function handleJoin() {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length !== 6) {
      setError('Please enter a 6-character class code.');
      return;
    }
    setError('');
    setLoading(true);

    const studentId = getOrCreateStudentId();

    try {
      const res = await fetch(`${API}/api/student/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, class_code: trimmedCode, name: studentName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        setError('Invalid code — ask your teacher for the right code.');
        return;
      }

      toast.success('You joined the class! 🎉');
      setSuccess({ class_name: data.class_name ?? 'Your Class', teacher_name: data.teacher_name ?? 'Your Teacher' });
      setStep('success');
    } catch {
      setError('Could not connect. Check your internet and try again.');
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
                    Your teacher will see this in the class.
                  </p>
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Priya"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
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
                    Hi <strong style={{ color: 'var(--color-text)' }}>{studentName}</strong>! Enter the 6-letter code your teacher gave you.
                  </p>
                </div>

                {/* Large code input */}
                <div className="flex flex-col gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="ABC123"
                    value={code}
                    maxLength={6}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    className="w-full px-6 py-4 rounded-xl text-center font-black text-3xl tracking-[0.3em] outline-none uppercase"
                    style={{
                      ...inputStyle,
                      letterSpacing: '0.3em',
                      caretColor: 'var(--color-primary)',
                    }}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {/* Char counter */}
                  <div className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
                    {code.length}/6 characters
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="rounded-xl px-4 py-3 text-sm font-medium"
                      style={{ background: '#FFF3CD', color: '#856404', border: '1px solid #FFEAA7' }}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      ⚠️ {error}
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

                <button
                  onClick={() => setStep('name')}
                  className="text-xs text-center"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Not {studentName}? Change name
                </button>
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

        {/* Back to home */}
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
