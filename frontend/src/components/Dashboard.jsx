import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ onBack, localStats }) => {
  // Doubt-to-mastery: concepts mastered live in the child's local/cloud stats
  // (the same gamification source XP and badges use), not the server analytics.
  const masteredTotal = Object.values(localStats?.mastered ?? {}).reduce((sum, n) => sum + n, 0);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/analytics/stats`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const fetchReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/report`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setReport(data);
    } catch {
      setReport({ headline: 'Could not generate report', summary: 'Please check the server and try again.', highlights: [], subjectInsight: '', recommendation: '' });
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-5" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="font-medium text-sm min-h-[44px] px-2 transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
        </div>

        {loading && <p className="text-sm text-center py-8" style={{ color: 'var(--color-muted)' }}>Loading stats…</p>}

        {error && (
          <div className="rounded-xl p-6 text-center card">
            <p style={{ color: 'var(--color-muted)' }}>Couldn't reach the server.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Check that the backend is running and try again.</p>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-xl p-5 card">
              <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>Total Questions Asked</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.totalQuestions || 0}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>children helped so far</p>
            </div>

            <div className="col-span-2 rounded-xl p-4 card">
              <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>🎯 Concepts Mastered</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{masteredTotal}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>quick checks aced on the first try</p>
            </div>

            <div className="rounded-xl p-4 card">
              <p className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>By Subject</p>
              {Object.keys(stats.bySubject || {}).length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No questions yet</p>
              )}
              {Object.entries(stats.bySubject || {}).map(([subj, count]) => (
                <div key={subj} className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{subj}</span>
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>{count}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-4 card">
              <p className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>By Age Group</p>
              {Object.keys(stats.byAge || {}).length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No questions yet</p>
              )}
              {Object.entries(stats.byAge || {}).map(([age, count]) => (
                <div key={age} className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{age === 'little' ? '🐣 6–10' : '🦋 11–14'}</span>
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>{count}</span>
                </div>
              ))}
            </div>

            <div className="col-span-2 rounded-xl p-4 card">
              <p className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Recent Activity (last 7 days)</p>
              {Object.keys(stats.byDate || {}).length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No activity yet</p>
              )}
              {Object.entries(stats.byDate || {}).slice(-7).reverse().map(([date, count]) => (
                <div key={date} className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{date}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min(count * 10, 80)}px`, background: 'var(--color-primary)', opacity: 0.7 }} />
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl p-5 card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>AI Impact Report</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Generated by the Report Agent</p>
            </div>
            <motion.button
              onClick={fetchReport}
              disabled={reportLoading}
              className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.97 }}
            >
              {reportLoading ? 'Generating…' : report ? 'Refresh' : 'Generate'}
            </motion.button>
          </div>

          <AnimatePresence>
            {report && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 mt-2"
              >
                <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{report.headline}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{report.summary}</p>
                {report.highlights?.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {report.highlights.map((h, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--color-text)' }}>
                        <span style={{ color: 'var(--color-primary)' }}>✓</span>{h}
                      </li>
                    ))}
                  </ul>
                )}
                {report.subjectInsight && (
                  <p className="text-xs italic" style={{ color: 'var(--color-muted)' }}>{report.subjectInsight}</p>
                )}
                {report.recommendation && (
                  <div className="rounded-xl p-3" style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--color-primary)' }}>Recommendation</p>
                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>{report.recommendation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
