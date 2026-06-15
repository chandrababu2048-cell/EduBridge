// Dashboard — usage stats for NGO staff / teachers (dark theme, not for kids).
import { useState, useEffect } from 'react';

const card = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)'
};

const Dashboard = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/analytics/stats`)
      .then((r) => { if (!r.ok) throw new Error('bad response'); return r.json(); })
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-[#00D4FF] font-bold min-h-[48px] px-2">← Back</button>
          <h1 className="text-2xl font-black text-white">📊 EduBridge Stats</h1>
        </div>

        {loading && <p className="text-center text-[#9CA3AF]">Loading stats...</p>}

        {error && (
          <div className="rounded-2xl p-6 text-center" style={card}>
            <p className="text-[#9CA3AF]">Couldn't reach the server. 😅</p>
            <p className="text-[#9CA3AF]/70 text-sm mt-1">Check that the backend is running and try again.</p>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl p-6" style={card}>
              <p className="text-[#9CA3AF] text-sm">Total Questions Asked</p>
              <p className="text-5xl font-black" style={{ color: '#6C63FF' }}>{stats.totalQuestions || 0}</p>
              <p className="text-[#9CA3AF] text-sm mt-1">children helped so far 🌟</p>
            </div>

            <div className="rounded-2xl p-4" style={card}>
              <p className="font-black text-white mb-3">By Subject</p>
              {Object.keys(stats.bySubject || {}).length === 0 && <p className="text-[#9CA3AF] text-sm">No questions yet</p>}
              {Object.entries(stats.bySubject || {}).map(([subject, count]) => (
                <div key={subject} className="flex justify-between items-center mb-2">
                  <span className="text-[#9CA3AF]">{subject}</span>
                  <span className="font-black text-[#00D4FF]">{count}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4" style={card}>
              <p className="font-black text-white mb-3">By Age Group</p>
              {Object.keys(stats.byAge || {}).length === 0 && <p className="text-[#9CA3AF] text-sm">No questions yet</p>}
              {Object.entries(stats.byAge || {}).map(([age, count]) => (
                <div key={age} className="flex justify-between items-center mb-2">
                  <span className="text-[#9CA3AF]">{age === 'little' ? '🐣 6-10' : '🦋 11-14'}</span>
                  <span className="font-black text-[#00FF88]">{count}</span>
                </div>
              ))}
            </div>

            <div className="col-span-2 rounded-2xl p-4" style={card}>
              <p className="font-black text-white mb-3">Recent Activity (last 7 days)</p>
              {Object.keys(stats.byDate || {}).length === 0 && <p className="text-[#9CA3AF] text-sm">No activity yet</p>}
              {Object.entries(stats.byDate || {})
                .slice(-7)
                .reverse()
                .map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center mb-2">
                    <span className="text-[#9CA3AF]">{date}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(count * 10, 100)}px`, background: 'linear-gradient(90deg,#6C63FF,#00D4FF)' }} />
                      <span className="font-black text-[#00D4FF]">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
