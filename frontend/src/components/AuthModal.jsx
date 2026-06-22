import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';

const Field = ({ label, type, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-xl px-4 py-3 text-sm outline-none transition-colors"
      style={{
        background: 'var(--color-surface2)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
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
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🌉</div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Edu<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Save your progress across devices</p>
          </div>

          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            {['signin', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className="flex-1 py-2.5 text-sm font-medium transition-colors"
                style={{
                  background: tab === t ? 'var(--color-primary)' : 'transparent',
                  color: tab === t ? 'var(--color-primary-text)' : 'var(--color-muted)',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

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
              className="py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? '…' : tab === 'signin' ? 'Sign In & Sync Progress' : 'Create Account'}
            </motion.button>
          </form>

          <button
            onClick={onClose}
            className="text-xs text-center transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            Continue as guest
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
