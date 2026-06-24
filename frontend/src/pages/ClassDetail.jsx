/**
 * ClassDetail — detailed view of a single class.
 * Route: /teacher/class/:classId
 *
 * Shows:
 *  - Class header with code + copy button
 *  - Stats row (students, questions, most active, avg XP)
 *  - Sortable student table with "needs attention" badges
 *  - Subject distribution bars (CSS-only, no recharts)
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SubjectBar from '../components/teacher/SubjectBar';
import { supabase } from '../lib/supabase.js';

const SUBJECT_EMOJI = {
  Math: '📐', Science: '🔬', English: '📖',
  'Civic Sense': '🏛️', 'My Rights': '⚖️',
  'Respect & Safety': '🛡️', Communication: '💬',
};

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

function needsAttention(student) {
  if (!student.lastActive) return true;
  const diff = Date.now() - new Date(student.lastActive).getTime();
  return diff > 7 * 24 * 60 * 60 * 1000 || student.totalQuestions === 0;
}

/* ── Skeleton row ──────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <td key={n} className="px-4 py-3">
          <div
            className="h-4 rounded animate-pulse"
            style={{ width: n === 1 ? '80%' : '60%', background: 'var(--color-surface2)' }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ── Stat card ─────────────────────────────────────────────────────── */
function StatCard({ emoji, label, value }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl px-4 py-5 text-center"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', minWidth: 120 }}
    >
      <span className="text-2xl mb-1">{emoji}</span>
      <span className="text-xl font-black leading-tight" style={{ color: 'var(--color-primary-text)' }}>{value}</span>
      <span className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{label}</span>
    </div>
  );
}

/* ── Sort toggle button ────────────────────────────────────────────── */
function SortBtn({ label, active, asc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
      style={{
        background: active ? 'var(--color-primary)' : 'var(--color-surface2)',
        color: active ? 'var(--color-primary-text)' : 'var(--color-muted)',
      }}
    >
      {label}
      {active && <span>{asc ? '↑' : '↓'}</span>}
    </button>
  );
}

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sortKey, setSortKey] = useState('xp');
  const [sortAsc, setSortAsc] = useState(false);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      // Fetch class info + members + their progress in parallel
      const [clsRes, membersRes] = await Promise.all([
        supabase.from('classes').select('*').eq('id', classId).single(),
        supabase.from('class_members')
          .select('student_id, joined_at, student_profiles(name, grade)')
          .eq('class_id', classId),
      ]);

      if (clsRes.error) throw clsRes.error;
      setCls(clsRes.data);

      const members = membersRes.data ?? [];
      const studentIds = members.map((m) => m.student_id);

      // Fetch progress for all students in this class
      let progressMap = {};
      if (studentIds.length > 0) {
        const { data: progRows } = await supabase
          .from('user_progress')
          .select('user_id, xp, total_questions, streak, last_subject, by_subject, updated_at')
          .in('user_id', studentIds);
        (progRows ?? []).forEach((p) => { progressMap[p.user_id] = p; });
      }

      // Merge members + progress
      const merged = members.map((m) => {
        const prog = progressMap[m.student_id] ?? {};
        return {
          student_id: m.student_id,
          name: m.student_profiles?.name ?? 'Unknown',
          grade: m.student_profiles?.grade ?? null,
          joined_at: m.joined_at,
          xp: prog.xp ?? 0,
          totalQuestions: prog.total_questions ?? 0,
          streak: prog.streak ?? 0,
          bySubject: prog.by_subject ?? {},
          lastActive: prog.updated_at ?? m.joined_at,
          topSubject: prog.last_subject ?? null,
        };
      });
      setProgress(merged);
    } catch (err) {
      console.warn('Class data error:', err.message);
      toast.error('Could not load class data');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function copyCode() {
    const code = cls?.class_code ?? cls?.code ?? '';
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success('Class code copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function toggleSort(key) {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sortedStudents = [...progress].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === 'xp') return dir * ((a.xp ?? 0) - (b.xp ?? 0));
    if (sortKey === 'questions') return dir * ((a.totalQuestions ?? 0) - (b.totalQuestions ?? 0));
    if (sortKey === 'lastActive') {
      return dir * (new Date(a.lastActive ?? 0).getTime() - new Date(b.lastActive ?? 0).getTime());
    }
    return 0;
  });

  /* ── Subject distribution ── */
  const subjectTotals = progress.reduce((acc, s) => {
    if (s.bySubject) {
      Object.entries(s.bySubject).forEach(([subj, count]) => {
        acc[subj] = (acc[subj] ?? 0) + count;
      });
    }
    return acc;
  }, {});
  const totalQs = Object.values(subjectTotals).reduce((a, b) => a + b, 0);

  /* ── Summary stats ── */
  const totalStudents = progress.length;
  const totalQuestions = progress.reduce((s, st) => s + (st.totalQuestions ?? 0), 0);
  const mostActive = progress.reduce((best, s) => (!best || (s.totalQuestions ?? 0) > (best.totalQuestions ?? 0)) ? s : best, null);
  const avgXP = progress.length > 0 ? Math.round(progress.reduce((s, st) => s + (st.xp ?? 0), 0) / progress.length) : 0;

  const code = cls?.class_code ?? cls?.code ?? '------';

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between gap-4"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0 px-3 py-2 rounded-xl transition-colors"
            style={{ color: 'var(--color-primary)', background: 'var(--color-surface2)' }}
          >
            ← Back
          </button>
          {cls && (
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate" style={{ color: 'var(--color-text)' }}>
                {cls.name}
                <span className="font-normal" style={{ color: 'var(--color-muted)' }}>
                  {' · '}{SUBJECT_EMOJI[cls.subject] ?? ''} {cls.subject}
                </span>
              </h1>
            </div>
          )}
        </div>

        {/* Code badge + copy */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Code:</span>
            <span className="text-sm font-black tracking-wider" style={{ color: 'var(--color-primary-text)' }}>{code}</span>
          </div>
          <motion.button
            onClick={copyCode}
            className="px-3 py-1.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? '✓' : '📋'}
          </motion.button>
        </div>
      </header>

      <main className="px-6 py-6 max-w-6xl mx-auto flex flex-col gap-8">
        {/* Stats row */}
        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatCard emoji="👥" label="Students" value={totalStudents} />
          <StatCard emoji="❓" label="Questions" value={totalQuestions} />
          <StatCard emoji="🏆" label="Most Active" value={mostActive?.name ?? '—'} />
          <StatCard emoji="⭐" label="Avg XP" value={avgXP} />
        </motion.div>

        {/* Student table */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          {/* Table header */}
          <div
            className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
            style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
          >
            <h2 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
              Students
              {progress.length > 0 && (
                <span className="ml-2 text-sm font-normal" style={{ color: 'var(--color-muted)' }}>
                  ({progress.length})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Sort by:</span>
              <SortBtn label="XP" active={sortKey === 'xp'} asc={sortAsc} onClick={() => toggleSort('xp')} />
              <SortBtn label="Questions" active={sortKey === 'questions'} asc={sortAsc} onClick={() => toggleSort('questions')} />
              <SortBtn label="Last Active" active={sortKey === 'lastActive'} asc={sortAsc} onClick={() => toggleSort('lastActive')} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto" style={{ background: 'var(--color-bg)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Name', 'Grade', 'Questions', 'XP', 'Top Subject', 'Last Active', 'Streak'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4].map((n) => <SkeletonRow key={n} />)
                ) : sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                      No students have joined yet. Share the class code: <strong style={{ color: 'var(--color-primary-text)' }}>{code}</strong>
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((student, i) => {
                    const attention = needsAttention(student);
                    const topSubj = student.bySubject
                      ? Object.entries(student.bySubject).sort((a, b) => b[1] - a[1])[0]?.[0]
                      : student.topSubject;
                    return (
                      <motion.tr
                        key={student.student_id ?? i}
                        className="border-b transition-colors"
                        style={{ borderColor: 'var(--color-border)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ backgroundColor: 'var(--color-surface)' }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
                            >
                              {(student.name ?? '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                {student.name ?? 'Unknown'}
                              </span>
                              {attention && (
                                <span
                                  className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                                  style={{ background: '#FFF3CD', color: '#856404' }}
                                >
                                  ⚠ Needs attention
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-muted)' }}>
                          {student.grade ? `Class ${student.grade}` : cls?.grade ? `Class ${cls.grade}` : '—'}
                        </td>
                        <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: 'var(--color-text)' }}>
                          {student.totalQuestions ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
                            style={{ background: 'var(--color-surface2)', color: 'var(--color-primary-text)' }}
                          >
                            ⭐ {student.xp ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>
                          {topSubj ? `${SUBJECT_EMOJI[topSubj] ?? '📚'} ${topSubj}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-muted)' }}>
                          {timeAgo(student.lastActive)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(student.streak ?? 0) > 0
                            ? <span>🔥 {student.streak}</span>
                            : <span style={{ color: 'var(--color-muted)' }}>—</span>}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Subject distribution */}
        {(totalQs > 0 || !loading) && (
          <motion.div
            className="rounded-2xl p-6"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <h2 className="font-bold text-base mb-5" style={{ color: 'var(--color-text)' }}>
              Subject Distribution
            </h2>
            {totalQs === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                No questions asked yet. Encourage students to start learning!
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {Object.entries(subjectTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([subj, count]) => (
                    <SubjectBar
                      key={subj}
                      subject={subj}
                      percent={Math.round((count / totalQs) * 100)}
                      count={count}
                    />
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
