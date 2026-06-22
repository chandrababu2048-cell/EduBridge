import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';

const Field = ({ label, type, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[#9CA3AF] text-xs font-bold uppercase tracking-wide">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#6C63FF] transition-colors text-sm"
      autoComplete={type === 'password' ? 'current-password' : 'email'}
    />
  </div>
);

export const AuthModal = ({ onClose }) => {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setError(''); setInfo(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      if (tab === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setInfo('Account created! Check your email to confirm, then sign in.');
        setTab('signin');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-full max-w-sm rounded-3xl p-8 flex flex-col gap-6"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 60px rgba(108,99,255,0.3)' }}
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
        >
          {/* Logo */}
          <div className="text-center">
            <div className="text-4xl mb-2">🌉</div>
            <h2 className="text-xl font-black text-white">
              Edu<span style={{ color: '#6C63FF' }}>Bridge</span>
            </h2>
            <p className="text-[#9CA3AF] text-sm mt-1">Save your progress across devices</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {['signin', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className="flex-1 py-2.5 text-sm font-bold transition-colors"
                style={{
                  background: tab === t ? 'linear-gradient(135deg, #6C63FF, #00D4FF)' : 'transparent',
                  color: tab === t ? '#fff' : '#9CA3AF',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

            {error && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">{error}</p>
            )}
            {info && (
              <p className="text-green-400 text-xs bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2">{info}</p>
            )}

            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              className="py-3 rounded-xl font-black text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? '...' : tab === 'signin' ? 'Sign In & Sync Progress' : 'Create Account'}
            </motion.button>
          </form>

          {/* Guest option */}
          <button
            onClick={onClose}
            className="text-[#9CA3AF] text-xs text-center hover:text-white transition-colors"
          >
            Continue as guest (progress stays on this device)
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
