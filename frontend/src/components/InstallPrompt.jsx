// InstallPrompt — a small banner that lets users install EduBridge as an app.
// Listens for the browser's `beforeinstallprompt` event (Android Chrome / desktop),
// and shows a friendly "Install" button. Dismissed state is remembered for the session.
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('edubridge_install_dismissed')) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();           // stop Chrome's default mini-infobar
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // If already installed, never show
    window.addEventListener('appinstalled', () => setShow(false));

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setShow(false);
    setDeferred(null);
  };

  const dismiss = () => {
    sessionStorage.setItem('edubridge_install_dismissed', '1');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md"
          initial={{ opacity: 0, y: 30, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 30, x: '-50%' }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'var(--color-primary)' }}
            >
              🌉
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Install EduBridge</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Add to your home screen — works offline</p>
            </div>
            <button
              onClick={install}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold shrink-0"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
            >
              Install
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="text-lg leading-none px-1 shrink-0"
              style={{ color: 'var(--color-muted)' }}
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
