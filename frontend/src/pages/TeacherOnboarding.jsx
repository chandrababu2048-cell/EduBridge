/**
 * TeacherOnboarding — 4-step wizard for first-time teacher setup.
 * Step 0: Create account (email + password) or sign in
 * Step 1: Name + School
 * Step 2: Grades taught (checkboxes 1–12)
 * Step 3: Create first class
 * Data saved directly to Supabase (teacher_profiles + classes tables).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const SUBJECTS = ['Math', 'Science', 'English', 'Civic Sense', 'My Rights', 'Respect & Safety', 'Communication'];
const ALL_GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/* ── Progress bar (steps 1-3 only) ────────────────────────────────── */
function StepBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2 flex-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300"
            style={{
              background: n <= step ? 'var(--color-primary)' : 'var(--color-surface2)',
              color: n <= step ? 'var(--color-primary-text)' : 'var(--color-muted)',
            }}
          >
            {n < step ? '✓' : n}
          </div>
          {n < 3 && (
            <div
              className="flex-1 h-0.5 rounded transition-all duration-500"
              style={{ background: n < step ? 'var(--color-primary)' : 'var(--color-surface2)' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputClass = `w-full px-4 py-3 rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition-all`;
const inputStyle = {
  background: 'var(--color-surface)',
  border: '1.5px solid var(--color-border)',
  color: 'var(--color-text)',
};

/* ── Main component ────────────────────────────────────────────────── */
export default function TeacherOnboarding() {
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const [step, setStep] = useState(0); // 0=auth, 1=name/school, 2=grades, 3=class
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  // Step 0 — auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Step 1
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');

  // Step 2
  const [grades, setGrades] = useState([]);

  // Step 3
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('Math');
  const [classGrade, setClassGrade] = useState('6');

  // If already logged in, check for existing profile
  useEffect(() => {
    if (user && step === 0) checkExistingProfile();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkExistingProfile() {
    if (!user || !supabase) { setStep(1); return; }
    const { data } = await supabase
      .from('teacher_profiles')
      .select('name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data?.name) navigate('/teacher/dashboard');
    else setStep(1);
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
        toast.success('Account created!');
        setStep(1);
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
        await checkExistingProfile();
      }
    } catch (err) {
      setAuthError(err.message ?? 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleGrade(g) {
    setGrades((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  function canNext() {
    if (step === 0) return email.trim().length > 3 && password.length >= 6;
    if (step === 1) return name.trim().length > 0 && school.trim().length > 0;
    if (step === 2) return grades.length > 0;
    if (step === 3) return className.trim().length > 0;
    return false;
  }

  async function handleFinish() {
    if (!user || !supabase) { toast.error('Not signed in'); return; }
    setLoading(true);
    try {
      const { error: profileError } = await supabase.from('teacher_profiles').upsert({
        user_id: user.id,
        name: name.trim(),
        school_name: school.trim(),
        grades: grades.map(String),
        subjects: [classSubject],
      });
      if (profileError) throw profileError;

      const classCode = generateClassCode();
      const { error: classError } = await supabase.from('classes').insert({
        teacher_id: user.id,
        name: className.trim(),
        subject: classSubject,
        grade: classGrade,
        class_code: classCode,
      });
      if (classError) throw classError;

      toast.success('Welcome to EduBridge! 🎉');
      navigate('/teacher/dashboard');
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    if (!canNext()) return;
    if (step === 0) { handleAuth(); return; }
    if (step < 3) setStep((s) => s + 1);
    else handleFinish();
  }

  const stepLabels = ['About You', 'Your Grades', 'First Class'];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌉</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Edu<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {step === 0 ? 'Teacher Sign Up' : `Teacher Setup — Step ${step} of 3: ${stepLabels[step - 1]}`}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {step > 0 && <StepBar step={step} />}

          <AnimatePresence mode="wait">

            {/* ── STEP 0 — Auth ── */}
            {step === 0 && (
              <motion.div
                key="step0"
                className="flex flex-col gap-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  {authMode === 'signup' ? 'Create your teacher account' : 'Sign in to your account'}
                </h2>

                {/* Toggle sign up / sign in */}
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
                      {m === 'signup' ? 'New Teacher' : 'Sign In'}
                    </button>
                  ))}
                </div>

                <Field label="Email address" htmlFor="onboard-email">
                  <input
                    id="onboard-email"
                    type="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setAuthError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    className={inputClass}
                    style={inputStyle}
                    autoFocus
                  />
                </Field>
                <Field label="Password" htmlFor="onboard-password">
                  <input
                    id="onboard-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    className={inputClass}
                    style={inputStyle}
                  />
                </Field>

                {authError && (
                  <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#FFF3CD', color: '#856404' }}>
                    ⚠️ {authError}
                  </p>
                )}

                <motion.button
                  onClick={handleNext}
                  disabled={!canNext() || loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm"
                  style={{
                    background: canNext() ? 'var(--color-primary)' : 'var(--color-surface2)',
                    color: canNext() ? 'var(--color-primary-text)' : 'var(--color-muted)',
                  }}
                  whileTap={canNext() ? { scale: 0.97 } : {}}
                >
                  {loading ? 'Please wait…' : authMode === 'signup' ? 'Create Account →' : 'Sign In →'}
                </motion.button>

                <button
                  onClick={() => navigate('/')}
                  className="text-xs text-center"
                  style={{ color: 'var(--color-muted)' }}
                >
                  ← Back to home
                </button>
              </motion.div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                className="flex flex-col gap-5"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  Tell us about yourself 👋
                </h2>
                <Field label="Your full name" htmlFor="onboard-name">
                  <input
                    id="onboard-name"
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    autoFocus
                  />
                </Field>
                <Field label="School name" htmlFor="onboard-school">
                  <input
                    id="onboard-school"
                    type="text"
                    placeholder="e.g. Government High School, Hyderabad"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </Field>
              </motion.div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                className="flex flex-col gap-5"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  Which grades do you teach? 🏫
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Select all that apply</p>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_GRADES.map((g) => {
                    const active = grades.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGrade(g)}
                        className="rounded-xl py-2.5 text-sm font-semibold transition-all duration-150"
                        style={{
                          background: active ? 'var(--color-primary)' : 'var(--color-surface2)',
                          color: active ? 'var(--color-primary-text)' : 'var(--color-muted)',
                          border: '1.5px solid',
                          borderColor: active ? 'var(--color-primary)' : 'transparent',
                        }}
                      >
                        Class {g}
                      </button>
                    );
                  })}
                </div>
                {grades.length > 0 && (
                  <p className="text-xs text-center" style={{ color: 'var(--color-primary)' }}>
                    {grades.length} grade{grades.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </motion.div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                className="flex flex-col gap-5"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  Create your first class 🎓
                </h2>
                <Field label="Class name" htmlFor="onboard-class-name">
                  <input
                    id="onboard-class-name"
                    type="text"
                    placeholder="e.g. Class 7A · Science"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    autoFocus
                  />
                </Field>
                <Field label="Subject" htmlFor="onboard-class-subject">
                  <select
                    id="onboard-class-subject"
                    value={classSubject}
                    onChange={(e) => setClassSubject(e.target.value)}
                    className={inputClass}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Grade" htmlFor="onboard-class-grade">
                  <select
                    id="onboard-class-grade"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className={inputClass}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={String(g)}>Class {g}</option>
                    ))}
                  </select>
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons (steps 1-3) */}
          {step > 0 && (
            <div className="flex items-center justify-between mt-8 gap-3">
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity"
                style={{
                  background: 'var(--color-surface2)',
                  color: 'var(--color-text)',
                }}
              >
                ← Back
              </button>
              <motion.button
                onClick={handleNext}
                disabled={!canNext() || loading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-opacity"
                style={{
                  background: canNext() ? 'var(--color-primary)' : 'var(--color-surface2)',
                  color: canNext() ? 'var(--color-primary-text)' : 'var(--color-muted)',
                  cursor: canNext() && !loading ? 'pointer' : 'not-allowed',
                }}
                whileTap={canNext() ? { scale: 0.97 } : {}}
              >
                {loading ? 'Saving…' : step === 3 ? 'Finish Setup →' : 'Next →'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
