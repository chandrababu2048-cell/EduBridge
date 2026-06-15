// EduBridge Analytics
// Lightweight, file-based usage tracking — no database needed for the MVP.
// Every question asked is logged to data/usage.json so NGO staff can see
// how many children are being helped, and which subjects are most popular.

import express from 'express';
import fs from 'fs';

const router = express.Router();
const ANALYTICS_FILE = './data/usage.json';

// Empty stats shape — used both as a default and when the file doesn't exist yet
const emptyStats = () => ({ totalQuestions: 0, bySubject: {}, byAge: {}, byLanguage: {}, byDate: {} });

// logUsage — called from the chat route after a question is answered.
// Reads the current counts, increments the relevant buckets, and saves.
// Wrapped in try/catch so analytics can NEVER break the actual tutoring.
export const logUsage = (subject, ageLevel, language) => {
  try {
    let data = emptyStats();
    if (fs.existsSync(ANALYTICS_FILE)) {
      data = { ...emptyStats(), ...JSON.parse(fs.readFileSync(ANALYTICS_FILE)) };
    }

    data.totalQuestions++;
    if (subject) data.bySubject[subject] = (data.bySubject[subject] || 0) + 1;
    if (ageLevel) data.byAge[ageLevel] = (data.byAge[ageLevel] || 0) + 1;
    if (language) data.byLanguage[language] = (data.byLanguage[language] || 0) + 1;

    const today = new Date().toISOString().split('T')[0];
    data.byDate[today] = (data.byDate[today] || 0) + 1;

    fs.mkdirSync('./data', { recursive: true });
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    // Log it for the maintainer but don't throw — the child still gets their answer
    console.error('Analytics error:', err);
  }
};

// GET /api/analytics/stats — returns the usage numbers for the dashboard
router.get('/stats', (req, res) => {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) {
      return res.json(emptyStats());
    }
    const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Could not load stats' });
  }
});

export default router;
