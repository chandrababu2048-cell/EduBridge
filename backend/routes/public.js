// EduBridge Public Routes — /api/public/*
// Unauthenticated endpoints used by the landing page impact counter.
// Aggregates counts from the local JSON stores — no auth required.

import express from 'express';
import { readStore } from '../lib/store.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/public/stats
// Returns high-level impact numbers for the landing page hero section.
// ---------------------------------------------------------------------------
router.get('/stats', (req, res) => {
  try {
    const students = readStore('students.json');
    const teachers = readStore('teachers.json');
    const usage = readStore('usage.json'); // written by analytics.js

    const totalStudents = Object.keys(students).length;
    const totalTeachers = Object.keys(teachers).length;
    const totalQuestions = usage.totalQuestions || 0;

    // Determine the most-asked subject from analytics bySubject map
    const bySubject = usage.bySubject || {};
    let topSubject = null;
    let topCount = 0;
    for (const [subject, count] of Object.entries(bySubject)) {
      if (count > topCount) {
        topCount = count;
        topSubject = subject;
      }
    }

    res.json({ totalStudents, totalQuestions, totalTeachers, topSubject });
  } catch (err) {
    console.error('GET /api/public/stats error:', err);
    res.status(500).json({ error: 'Failed to load public stats' });
  }
});

export default router;
