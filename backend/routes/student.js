// EduBridge Student Routes — /api/student/*
// Handles student profile management and class enrolment via class code.

import express from 'express';
import { readStore, writeStore } from '../lib/store.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/student/profile
// Body: { student_id, name, grade, school_name }
// Upserts a student record.
// ---------------------------------------------------------------------------
router.post('/profile', (req, res) => {
  try {
    const { student_id, name, grade, school_name } = req.body;

    if (!student_id || !name) {
      return res.status(400).json({ error: 'student_id and name are required' });
    }

    const students = readStore('students.json');

    students[student_id] = {
      name,
      grade: grade || '',
      school_name: school_name || '',
      updated_at: new Date().toISOString()
    };

    writeStore('students.json', students);
    res.json({ success: true, student: { student_id, ...students[student_id] } });
  } catch (err) {
    console.error('POST /api/student/profile error:', err);
    res.status(500).json({ error: 'Failed to save student profile' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/student/join
// Body: { student_id, class_code }
// Finds the class by its 6-char code and adds the student as a member.
// Idempotent — joining an already-joined class is a no-op.
// ---------------------------------------------------------------------------
router.post('/join', (req, res) => {
  try {
    const { student_id, class_code } = req.body;

    if (!student_id || !class_code) {
      return res.status(400).json({ error: 'student_id and class_code are required' });
    }

    // Find the class that has this code
    const classes = readStore('classes.json');
    const matchEntry = Object.entries(classes).find(
      ([, cls]) => cls.class_code === class_code.toUpperCase()
    );

    if (!matchEntry) {
      return res.status(404).json({ error: 'Invalid class code — no class found' });
    }

    const [classId, cls] = matchEntry;

    if (!cls.active) {
      return res.status(400).json({ error: 'This class is no longer active' });
    }

    // Add to class_members (idempotent)
    const allMembers = readStore('class_members.json');
    const members = allMembers[classId] || [];

    const alreadyMember = members.some(m => m.student_id === student_id);
    if (!alreadyMember) {
      members.push({ student_id, joined_at: new Date().toISOString() });
      allMembers[classId] = members;
      writeStore('class_members.json', allMembers);
    }

    res.json({
      success: true,
      classId,
      class: {
        name: cls.name,
        subject: cls.subject,
        grade: cls.grade
      },
      already_member: alreadyMember
    });
  } catch (err) {
    console.error('POST /api/student/join error:', err);
    res.status(500).json({ error: 'Failed to join class' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/student/classes?student_id=X
// Returns all classes the student has joined, with class details attached.
// ---------------------------------------------------------------------------
router.get('/classes', (req, res) => {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id query param is required' });
    }

    const allMembers = readStore('class_members.json');
    const classes = readStore('classes.json');

    // Collect every classId where this student appears
    const joined = Object.entries(allMembers)
      .filter(([, members]) => members.some(m => m.student_id === student_id))
      .map(([classId, members]) => {
        const cls = classes[classId] || {};
        const membership = members.find(m => m.student_id === student_id);
        return {
          classId,
          name: cls.name,
          subject: cls.subject,
          grade: cls.grade,
          class_code: cls.class_code,
          active: cls.active,
          joined_at: membership ? membership.joined_at : null
        };
      });

    res.json({ classes: joined });
  } catch (err) {
    console.error('GET /api/student/classes error:', err);
    res.status(500).json({ error: 'Failed to load student classes' });
  }
});

export default router;
