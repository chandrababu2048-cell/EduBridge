// EduBridge Chat Route
// Receives a child's question and returns Claude's tutoring response

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from '../prompts/systemPrompts.js';
import { logUsage } from './analytics.js';

const router = express.Router();

// Initialize the Anthropic client — API key comes from .env, never hardcoded
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Allowlists — must stay in sync with the frontend constants
const VALID_SUBJECTS = ['Math', 'Science', 'English', 'Civic Sense', 'My Rights', 'Respect & Safety', 'Communication'];
const VALID_AGE_LEVELS = ['little', 'older'];
const VALID_LANGUAGES = ['english', 'hindi', 'telugu', 'tamil', 'kannada', 'bengali', 'marathi'];
const CHAPTER_NAME_MAX_LEN = 120;

// POST /api/chat — main tutoring endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, subject, ageLevel, language, grade, chapterName, chapterIndex } = req.body;

    // Validate the incoming message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Reject messages that are unreasonably long to protect API costs
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message is too long. Please keep it under 2000 characters.' });
    }

    // Validate subject, ageLevel and language against allowlists to prevent
    // prompt injection through these fields (they are interpolated into the system prompt)
    const safeSubject = VALID_SUBJECTS.includes(subject) ? subject : 'Math';
    const safeAgeLevel = VALID_AGE_LEVELS.includes(ageLevel) ? ageLevel : 'little';
    const safeLanguage = VALID_LANGUAGES.includes(language) ? language : 'english';

    // Validate grade (must be an integer 1–12)
    const safeGrade = Number.isInteger(Number(grade)) && Number(grade) >= 1 && Number(grade) <= 12
      ? Number(grade)
      : undefined;

    // chapterName is embedded verbatim in the system prompt — cap its length
    const safeChapterName = typeof chapterName === 'string'
      ? chapterName.slice(0, CHAPTER_NAME_MAX_LEN)
      : undefined;

    const safeChapterIndex = Number.isInteger(Number(chapterIndex)) && Number(chapterIndex) >= 1
      ? Number(chapterIndex)
      : undefined;

    // Build the child-friendly system prompt for this subject/age/language
    const systemPrompt = getSystemPrompt(safeSubject, safeAgeLevel, safeLanguage, {
      grade: safeGrade,
      chapterName: safeChapterName,
      chapterIndex: safeChapterIndex,
    });

    // Call Claude API (claude-sonnet-4-6, max 1024 tokens per AGENTS.md)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    // Record this question for the analytics dashboard (never blocks the reply)
    logUsage(safeSubject, safeAgeLevel, safeLanguage);

    // Send Claude's reply back to the frontend
    const reply = response.content?.[0]?.text;
    if (!reply) {
      console.error('Claude returned no content');
      return res.status(500).json({ error: 'Failed to get response' });
    }
    res.json({ reply });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router;
