// Agent Routes — /api/agents/*
// Each route calls one specialist AI agent and returns structured JSON.
import express from 'express';
import fs from 'fs';
import { checkMessageSafety } from '../agents/safetyMonitor.js';
import { generateQuiz } from '../agents/quizGenerator.js';
import { getStudyPlan } from '../agents/studyPlanner.js';
import { generateReport } from '../agents/reportGenerator.js';

const router = express.Router();
const ANALYTICS_FILE = './data/usage.json';

// POST /api/agents/safety-check
// Called by the frontend before sending a message to the tutor.
router.post('/safety-check', async (req, res) => {
  const { message, ageLevel } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message required' });
  }
  const result = await checkMessageSafety(message.trim(), ageLevel || 'little');
  res.json(result);
});

// POST /api/agents/quiz
// Generates 3 multiple-choice questions for the given subject and age level.
router.post('/quiz', async (req, res) => {
  try {
    const { subject, ageLevel } = req.body;
    if (!subject) return res.status(400).json({ error: 'subject required' });
    const quiz = await generateQuiz(subject, ageLevel || 'little');
    res.json(quiz);
  } catch (err) {
    console.error('Quiz agent error:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// POST /api/agents/study-plan
// Returns next-step recommendations based on the child's learning stats.
router.post('/study-plan', async (req, res) => {
  try {
    const { stats, ageLevel } = req.body;
    if (!stats) return res.status(400).json({ error: 'stats required' });
    const plan = await getStudyPlan(stats, ageLevel || 'little');
    res.json(plan);
  } catch (err) {
    console.error('Study planner error:', err);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// GET /api/agents/report
// Generates a formatted impact report for teachers and NGO staff.
router.get('/report', async (req, res) => {
  try {
    let data = { totalQuestions: 0, bySubject: {}, byAge: {}, byLanguage: {}, byDate: {} };
    if (fs.existsSync(ANALYTICS_FILE)) {
      data = { ...data, ...JSON.parse(fs.readFileSync(ANALYTICS_FILE)) };
    }
    const report = await generateReport(data);
    res.json(report);
  } catch (err) {
    console.error('Report agent error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
