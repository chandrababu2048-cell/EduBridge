/**
 * TeacherOnboarding — 3-step wizard for first-time teacher setup.
 * Step 1: Name + School
 * Step 2: Grades taught (checkboxes 1–12)
 * Step 3: Create first class (name, subject, grade)
 * On complete → POST /api/teacher/profile + POST /api/teacher/class → /teacher/dashboard
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL ?? '';

const SUBJECTS = ['Math', 'Science', 'English', 'Civic Sense', 'My Rights', 'Respect & Safety', 'Communication'];
const ALL_GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

function getOrCreateTeacherId() {
  let id = localStorage.getItem('edubridge_teacher_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('edubridge_teacher_id', id);
  }
  return id;
}

/* ── Progress bar ──────────────────────────────────────────────────── */
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

/* ── Field wrapper ─────────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputClass = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all`;
const inputStyle = {
  background: 'var(--color-surface)',
  border: '1.5px solid var(--color-border)',
  color: 'var(--color-text)',
};

/* ── Main component ────────────────────────────────────────────────── */
export default function TeacherOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');

  // Step 2
  const [grades, setGrades] = useState([]);

  // Step 3
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('Math');
  const [classGrade, setClassGrade] = useState('6');

  function toggleGrade(g) {
    setGrades((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  function canNext() {
    if (step === 1) return name.trim().length > 0 && school.trim().length > 0;
    if (step === 2) return grades.length > 0;
    if (step === 3) return className.trim().length > 0;
    return false;
  }

  async function handleFinish() {
    if (!canNext()) return;
    setLoading(true);
    const teacherId = getOrCreateTeacherId();

    try {
      // Save profile
      const profileRes = await fetch(`${API}/api/teacher/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId, name, school_name: school, grades, subjects: [classSubject] }),
      });
      if (!profileRes.ok) throw new Error('Failed to save profile');

      const profile = { name, school_name: school, grades };
      localStorage.setItem('edubridge_teacher_profile', JSON.stringify(profile));

      // Create first class
      const classRes = await fetch(`${API}/api/teacher/class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId, name: className, subject: classSubject, grade: classGrade }),
      });
      if (!classRes.ok) throw new Error('Failed to create class');

      toast.success('Welcome to EduBridge! 🎉');
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    if (!canNext()) return;
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
            Teacher Setup — Step {step} of 3: {stepLabels[step - 1]}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <StepBar step={step} />

          <AnimatePresence mode="wait">
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
                <Field label="Your full name">
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    autoFocus
                  />
                </Field>
                <Field label="School name">
                  <input
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
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Select all that apply
                </p>
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
                <Field label="Class name">
                  <input
                    type="text"
                    placeholder="e.g. Class 7A · Science"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    autoFocus
                  />
                </Field>
                <Field label="Subject">
                  <select
                    value={classSubject}
                    onChange={(e) => setClassSubject(e.target.value)}
                    className={inputClass}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Grade">
                  <select
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

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8 gap-3">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity"
              style={{
                background: 'var(--color-surface2)',
                color: step === 1 ? 'var(--color-surface2)' : 'var(--color-text)',
                opacity: step === 1 ? 0 : 1,
                pointerEvents: step === 1 ? 'none' : 'auto',
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
        </div>
      </motion.div>
    </div>
  );
}
