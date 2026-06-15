// Dashboard — usage stats for NGO staff / teachers (not shown to kids).
// Pulls totals from the backend /api/analytics/stats endpoint.
import { useState, useEffect } from 'react';

const Dashboard = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/analytics/stats`)
      .then(r => {
        if (!r.ok) throw new Error('bad response');
        return r.json();
      })
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-[#4F86C6] font-bold min-h-[48px] px-2">← Back</button>
          <h1 className="text-2xl font-extrabold text-[#2D3748]">📊 EduBridge Stats</h1>
        </div>

        {loading && <p className="text-center text-gray-400">Loading stats...</p>}

        {error && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">Couldn't reach the server. 😅</p>
            <p className="text-gray-400 text-sm mt-1">Check that the backend is running and try again.</p>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 gap-4">

            {/* Total Questions */}
            <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Total Questions Asked</p>
              <p className="text-5xl font-extrabold text-[#4F86C6]">{stats.totalQuestions || 0}</p>
              <p className="text-gray-400 text-sm mt-1">children helped so far 🌟</p>
            </div>

            {/* By Subject */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="font-bold text-[#2D3748] mb-3">By Subject</p>
              {Object.keys(stats.bySubject || {}).length === 0 && (
                <p className="text-gray-400 text-sm">No questions yet</p>
              )}
              {Object.entries(stats.bySubject || {}).map(([subject, count]) => (
                <div key={subject} className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{subject}</span>
                  <span className="font-bold text-[#4F86C6]">{count}</span>
                </div>
              ))}
            </div>

            {/* By Age */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="font-bold text-[#2D3748] mb-3">By Age Group</p>
              {Object.keys(stats.byAge || {}).length === 0 && (
                <p className="text-gray-400 text-sm">No questions yet</p>
              )}
              {Object.entries(stats.byAge || {}).map(([age, count]) => (
                <div key={age} className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{age === 'little' ? '🐣 6-10' : '🦋 11-14'}</span>
                  <span className="font-bold text-[#67C99A]">{count}</span>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="font-bold text-[#2D3748] mb-3">Recent Activity (last 7 days)</p>
              {Object.keys(stats.byDate || {}).length === 0 && (
                <p className="text-gray-400 text-sm">No activity yet</p>
              )}
              {Object.entries(stats.byDate || {})
                .slice(-7)
                .reverse()
                .map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">{date}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="bg-[#4F86C6] h-2 rounded-full"
                        style={{ width: `${Math.min(count * 10, 100)}px` }}
                      />
                      <span className="font-bold text-[#4F86C6]">{count}</span>
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
