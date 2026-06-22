// EduBridge Teacher Routes — /api/teacher/*
// Handles teacher profile management and classroom creation/lookup.
// Auth is intentionally minimal for MVP (teacher_id in query/body);
// proper JWT auth will be layered in once Supabase is connected.

import express from 'express';
import crypto from 'crypto';
import { readStore, writeStore } from '../lib/store.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// Helper — generate a random 6-character uppercase alphanumeric class code
// ---------------------------------------------------------------------------
const generateClassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// ---------------------------------------------------------------------------
// Helper — ensure the generated class code is unique across existing classes
// ---------------------------------------------------------------------------
const uniqueClassCode = (classes) => {
  let code;
  const existing = new Set(Object.values(classes).map(c => c.class_code));
  do {
    code = generateClassCode();
  } while (existing.has(code));
  return code;
};

// ---------------------------------------------------------------------------
// POST /api/teacher/profile
// Body: { teacher_id, name, school_name, grades[], subjects[] }
// Upserts (creates or updates) a teacher record.
// ---------------------------------------------------------------------------
router.post('/profile', (req, res) => {
  try {
    const { teacher_id, name, school_name, grades = [], subjects = [] } = req.body;

    if (!teacher_id || !name) {
      return res.status(400).json({ error: 'teacher_id and name are required' });
    }

    const teachers = readStore('teachers.json');

    teachers[teacher_id] = {
      name,
      school_name: school_name || '',
      grades,
      subjects,
      updated_at: new Date().toISOString()
    };

    writeStore('teachers.json', teachers);
    res.json({ success: true, teacher: { teacher_id, ...teachers[teacher_id] } });
  } catch (err) {
    console.error('POST /api/teacher/profile error:', err);
    res.status(500).json({ error: 'Failed to save teacher profile' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/teacher/class
// Body: { teacher_id, name, subject, grade }
// Creates a new class and returns the generated class_code.
// ---------------------------------------------------------------------------
router.post('/class', (req, res) => {
  try {
    const { teacher_id, name, subject, grade } = req.body;

    if (!teacher_id || !name || !subject || !grade) {
      return res.status(400).json({ error: 'teacher_id, name, subject, and grade are required' });
    }

    const classes = readStore('classes.json');
    const classId = crypto.randomUUID();
    const class_code = uniqueClassCode(classes);

    classes[classId] = {
      id: classId,
      teacher_id,
      name,
      subject,
      grade,
      class_code,
      active: true,
      created_at: new Date().toISOString()
    };

    writeStore('classes.json', classes);
    res.status(201).json({ classId, class_code });
  } catch (err) {
    console.error('POST /api/teacher/class error:', err);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/teacher/classes?teacher_id=X
// Returns all classes belonging to the given teacher.
// ---------------------------------------------------------------------------
router.get('/classes', (req, res) => {
  try {
    const { teacher_id } = req.query;

    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id query param is required' });
    }

    const classes = readStore('classes.json');
    const teacherClasses = Object.values(classes).filter(c => c.teacher_id === teacher_id);

    res.json({ classes: teacherClasses });
  } catch (err) {
    console.error('GET /api/teacher/classes error:', err);
    res.status(500).json({ error: 'Failed to load classes' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/teacher/class/:classId
// Returns class details plus the list of member student IDs/join dates.
// ---------------------------------------------------------------------------
router.get('/class/:classId', (req, res) => {
  try {
    const { classId } = req.params;

    const classes = readStore('classes.json');
    const cls = classes[classId];

    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const allMembers = readStore('class_members.json');
    const members = allMembers[classId] || [];

    res.json({ ...cls, members });
  } catch (err) {
    console.error('GET /api/teacher/class/:classId error:', err);
    res.status(500).json({ error: 'Failed to load class details' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/teacher/class/:classId/progress
// Returns each class member with their usage/progress data joined in.
// Progress is sourced from the analytics usage.json keyed by student_id.
// ---------------------------------------------------------------------------
router.get('/class/:classId/progress', (req, res) => {
  try {
    const { classId } = req.params;

    const classes = readStore('classes.json');
    if (!classes[classId]) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const allMembers = readStore('class_members.json');
    const members = allMembers[classId] || [];

    const students = readStore('students.json');

    // Build a progress summary per member.
    // In the MVP there is no per-student analytics yet — we return the
    // profile data and a placeholder so the frontend can render a table now
    // and we can fill in real metrics later.
    const progress = members.map(({ student_id, joined_at }) => {
      const profile = students[student_id] || {};
      return {
        student_id,
        name: profile.name || 'Unknown',
        grade: profile.grade || '',
        joined_at,
        // Placeholder metrics — replace with real per-student data when available
        questions_asked: profile.questions_asked || 0,
        last_active: profile.last_active || null
      };
    });

    res.json({ classId, progress });
  } catch (err) {
    console.error('GET /api/teacher/class/:classId/progress error:', err);
    res.status(500).json({ error: 'Failed to load class progress' });
  }
});

export default router;
