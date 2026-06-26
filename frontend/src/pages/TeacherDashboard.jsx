/**
 * TeacherDashboard — main teacher view with sidebar + class card grid.
 * Route: /teacher/dashboard
 * Auth: reads teacher from Supabase auth (useAuth hook).
 * Data: reads/writes classes directly to Supabase (classes table).
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const SUBJECTS = ['Math', 'Science', 'English', 'Civic Sense', 'My Rights', 'Respect & Safety', 'Communication'];
const ALL_GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

const SUBJECT_EMOJI = {
  Math: '📐', Science: '🔬', English: '📖',
  'Civic Sense': '🏛️', 'My Rights': '⚖️',
  'Respect & Safety': '🛡️', Communication: '💬',
};

function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h !== 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? 's' : ''} ago`;
}

/* ── Skeleton card ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 animate-pulse"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="h-5 rounded-lg w-3/4" style={{ background: 'var(--color-surface2)' }} />
      <div className="h-4 rounded-lg w-1/2" style={{ background: 'var(--color-surface2)' }} />
      <div className="h-4 rounded-lg w-2/3" style={{ background: 'var(--color-surface2)' }} />
    </div>
  );
}

/* ── Class card ────────────────────────────────────────────────────── */
function ClassCard({ cls }) {
  const navigate = useNavigate();
  const emoji = SUBJECT_EMOJI[cls.subject] ?? '📚';
  const memberCount = cls.class_members?.[0]?.count ?? 0;

  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col gap-4 cursor-pointer group"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(2,216,233,0.12)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/teacher/class/${cls.id}`)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{emoji}</span>
            <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
              {cls.name}
            </h3>
          </div>
          <span
            className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: 'var(--color-surface2)', color: 'var(--color-muted)' }}
          >
            Class {cls.grade}
          </span>
        </div>
        <span
          className="text-xs font-mono font-bold px-2 py-1 rounded-lg tracking-widest flex-shrink-0"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
        >
          {cls.class_code}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-muted)' }}>
        <span>👥 {memberCount} student{memberCount !== 1 ? 's' : ''}</span>
        <span>📖 {cls.subject}</span>
      </div>

      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Created {timeAgo(cls.created_at)}
        </span>
        <span
          className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-primary)' }}
        >
          View class →
        </span>
      </div>
    </motion.div>
  );
}

/* ── Create Class Modal ────────────────────────────────────────────── */
function CreateClassModal({ onClose, onCreated, teacherId }) {
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('Math');
  const [grade, setGrade] = useState('6');
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!className.trim() || !supabase) return;
    setLoading(true);
    try {
      const classCode = generateClassCode();
      const { data, error } = await supabase.from('classes').insert({
        teacher_id: teacherId,
        name: className.trim(),
        subject,
        grade,
        class_code: classCode,
      }).select().single();
      if (error) throw error;
      setSuccessCode(data.class_code);
      onCreated();
    } catch (err) {
      toast.error(err.message ?? 'Failed to create class');
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(successCode).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const inputStyle = {
    background: 'var(--color-surface2)',
    border: '1.5px solid var(--color-border)',
    color: 'var(--color-text)',
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-md rounded-2xl p-8 z-10"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'var(--color-surface2)', color: 'var(--color-muted)' }}
        >
          ×
        </button>

        {!successCode ? (
          <>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Create a new class</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-class-name" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Class name</label>
                <input
                  id="create-class-name"
                  autoFocus
                  type="text"
                  placeholder="e.g. Class 7A · Science"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  style={inputStyle}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-class-subject" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Subject</label>
                <select
                  id="create-class-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] cursor-pointer"
                  style={inputStyle}
                >
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-class-grade" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Grade</label>
                <select
                  id="create-class-grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] cursor-pointer"
                  style={inputStyle}
                >
                  {ALL_GRADES.map((g) => <option key={g} value={String(g)}>Class {g}</option>)}
                </select>
              </div>
            </div>
            <motion.button
              onClick={handleCreate}
              disabled={!className.trim() || loading}
              className="w-full mt-6 py-3 rounded-xl font-semibold text-sm"
              style={{
                background: className.trim() ? 'var(--color-primary)' : 'var(--color-surface2)',
                color: className.trim() ? 'var(--color-primary-text)' : 'var(--color-muted)',
              }}
              whileTap={className.trim() ? { scale: 0.97 } : {}}
            >
              {loading ? 'Creating…' : 'Create Class'}
            </motion.button>
          </>
        ) : (
          <motion.div
            className="flex flex-col items-center text-center gap-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-5xl">🎉</div>
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Class Created!</h2>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Share this code with your students:</p>
            </div>
            <div
              className="px-8 py-4 rounded-2xl"
              style={{ background: 'var(--color-surface2)', border: '2px dashed var(--color-primary)' }}
            >
              <span className="text-3xl font-black tracking-[0.25em]" style={{ color: 'var(--color-primary-text)' }}>
                {successCode}
              </span>
            </div>
            <motion.button
              onClick={copyCode}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
              whileTap={{ scale: 0.97 }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </motion.button>
            <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Close</button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────────── */
function Sidebar({ activeTab, setActiveTab, teacherName, onSignOut, mobileOpen, onCloseMobile }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', emoji: '🏠' },
    { id: 'classes', label: 'My Classes', emoji: '🎓' },
    { id: 'reports', label: 'Reports', emoji: '📊' },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          transition-transform duration-300
          md:relative md:translate-x-0 md:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: 240, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-2xl">🌉</span>
          <div>
            <p className="text-base font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
              Edu<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
            </p>
            <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>Teacher Portal</p>
          </div>
          <button
            className="ml-auto md:hidden w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: 'var(--color-muted)' }}
            onClick={onCloseMobile}
          >
            ✕
          </button>
        </div>

        {teacherName && (
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Signed in as</p>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{teacherName}</p>
          </div>
        )}

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {links.map(({ id, label, emoji }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveTab(id); onCloseMobile(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left w-full transition-all"
                style={{
                  background: active ? 'var(--color-primary)' : 'transparent',
                  color: active ? 'var(--color-primary-text)' : 'var(--color-text)',
                }}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left"
            style={{ color: 'var(--color-muted)' }}
          >
            <span>🚪</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Main Dashboard ────────────────────────────────────────────────── */
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const [profileRes, classesRes] = await Promise.all([
        supabase.from('teacher_profiles').select('name, school_name').eq('user_id', user.id).maybeSingle(),
        supabase.from('classes')
          .select('*, class_members(count)')
          .eq('teacher_id', user.id)
          .eq('active', true)
          .order('created_at', { ascending: false }),
      ]);
      setTeacherProfile(profileRes.data);
      setClasses(classesRes.data ?? []);
    } catch (err) {
      console.warn('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/teacher/onboarding'); return; }
    fetchData();
  }, [user, authLoading, fetchData, navigate]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (authLoading) return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        teacherName={teacherProfile?.name}
        onSignOut={handleSignOut}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-6 py-4 gap-4"
          style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg"
              style={{ color: 'var(--color-text)', background: 'var(--color-surface2)' }}
              onClick={() => setMobileMenuOpen(true)}
            >
              ☰
            </button>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {activeTab === 'classes' ? 'My Classes' : activeTab === 'dashboard' ? 'Dashboard' : 'Reports'}
            </h1>
          </div>
          <motion.button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
            whileHover={{ opacity: 0.88 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>+</span>
            <span className="hidden sm:inline">Create Class</span>
            <span className="sm:hidden">New</span>
          </motion.button>
        </header>

        <main className="flex-1 px-6 py-6">
          <AnimatePresence mode="wait">
            {activeTab === 'classes' && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
                  </div>
                ) : classes.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-24 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="text-6xl mb-4">🏫</div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>No classes yet</h2>
                    <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                      Create your first class to get started. Students can join using a class code.
                    </p>
                    <motion.button
                      onClick={() => setShowCreate(true)}
                      className="px-6 py-3 rounded-xl font-semibold text-sm"
                      style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
                      whileHover={{ opacity: 0.88 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      + Create your first class
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {classes.map((cls, i) => (
                      <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <ClassCard cls={cls} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-tab"
                className="flex flex-col gap-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Classes', value: classes.length, emoji: '🎓' },
                    { label: 'Total Students', value: classes.reduce((s, c) => s + (c.class_members?.[0]?.count ?? 0), 0), emoji: '👥' },
                    { label: 'Subjects', value: [...new Set(classes.map((c) => c.subject))].length, emoji: '📚' },
                    { label: 'Grades', value: [...new Set(classes.map((c) => c.grade))].length, emoji: '🏫' },
                  ].map(({ label, value, emoji }) => (
                    <div
                      key={label}
                      className="rounded-2xl p-5"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="text-2xl mb-2">{emoji}</div>
                      <div className="text-2xl font-black" style={{ color: 'var(--color-primary-text)' }}>{value}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>
                  Switch to "My Classes" to view individual class details.
                </p>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports-tab"
                className="flex flex-col items-center justify-center py-24 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-5xl mb-4">📊</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Reports coming soon</h2>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Detailed progress reports will appear here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateClassModal
            teacherId={user?.id}
            onClose={() => setShowCreate(false)}
            onCreated={() => { fetchData(); setShowCreate(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
