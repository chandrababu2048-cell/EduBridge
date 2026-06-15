// useStats — tracks learning stats locally so badges can unlock.
// Persisted in localStorage. recordQuestion() is called each time a child asks.
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'edubridge_stats';

const emptyStats = () => ({
  totalQuestions: 0,
  bySubject: { Math: 0, Science: 0, English: 0 },
  streak: 0,
  lastSubject: null,
  usedTelugu: false,
  learnedEarly: false
});

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...emptyStats(), ...saved, bySubject: { ...emptyStats().bySubject, ...saved.bySubject } } : emptyStats();
  } catch {
    return emptyStats();
  }
};

export const useStats = () => {
  const [stats, setStats] = useState(load);

  const recordQuestion = useCallback(({ subject, language }) => {
    setStats((prev) => {
      const next = {
        ...prev,
        bySubject: { ...prev.bySubject },
        totalQuestions: prev.totalQuestions + 1,
        // streak counts consecutive questions in the same subject
        streak: prev.lastSubject === subject ? prev.streak + 1 : 1,
        lastSubject: subject,
        usedTelugu: prev.usedTelugu || language === 'telugu',
        learnedEarly: prev.learnedEarly || new Date().getHours() < 8
      };
      if (subject) next.bySubject[subject] = (next.bySubject[subject] || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { stats, recordQuestion };
};
