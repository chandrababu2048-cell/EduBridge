// POST /api/chat — the main tutoring endpoint (Vercel Serverless Function).
// Replaces the Express backend for production. Calls the Claude API with a
// child-friendly system prompt and returns a simple answer.
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import { getSystemPrompt } from './_lib/systemPrompts.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Allowlists — prevent prompt injection via interpolated fields
const VALID_SUBJECTS = ['Math', 'Science', 'English', 'Civic Sense', 'My Rights', 'Respect & Safety', 'Communication'];
const VALID_AGE_LEVELS = ['little', 'older'];
const VALID_LANGUAGES = ['english', 'hindi', 'telugu', 'tamil', 'kannada', 'bengali', 'marathi'];
const CHAPTER_NAME_MAX_LEN = 120;

// --- Best-effort rate limit (per warm instance) ---
// Protects the API key from runaway loops. Note: serverless instances are
// short-lived, so this is a safety net, not a hard global guarantee.
const hits = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 20;

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

// --- Best-effort usage logging ---
// Writes to /tmp (the only writable path on Vercel). This is approximate and
// may reset on cold starts. For durable analytics, add Vercel KV later.
const USAGE_FILE = '/tmp/usage.json';

function logUsage(subject, ageLevel, language) {
  try {
    let data = { totalQuestions: 0, bySubject: {}, byAge: {}, byLanguage: {}, byDate: {} };
    if (fs.existsSync(USAGE_FILE)) {
      data = { ...data, ...JSON.parse(fs.readFileSync(USAGE_FILE)) };
    }
    data.totalQuestions++;
    if (subject) data.bySubject[subject] = (data.bySubject[subject] || 0) + 1;
    if (ageLevel) data.byAge[ageLevel] = (data.byAge[ageLevel] || 0) + 1;
    if (language) data.byLanguage[language] = (data.byLanguage[language] || 0) + 1;
    const today = new Date().toISOString().split('T')[0];
    data.byDate[today] = (data.byDate[today] || 0) + 1;
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data));
  } catch (err) {
    console.error('Analytics error:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, subject, ageLevel, language, grade, chapterName, chapterIndex } = req.body || {};

    // Validate the incoming message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Reject messages that are unreasonably long to protect API costs
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message is too long. Please keep it under 2000 characters.' });
    }

    // Kid-friendly rate-limit message
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many questions! Please wait a minute 😊' });
    }

    // Validate fields against allowlists — they are interpolated into the system prompt
    const safeSubject = VALID_SUBJECTS.includes(subject) ? subject : 'Math';
    const safeAgeLevel = VALID_AGE_LEVELS.includes(ageLevel) ? ageLevel : 'little';
    const safeLanguage = VALID_LANGUAGES.includes(language) ? language : 'english';

    const safeGrade = Number.isInteger(Number(grade)) && Number(grade) >= 1 && Number(grade) <= 12
      ? Number(grade)
      : undefined;

    const safeChapterName = typeof chapterName === 'string'
      ? chapterName.slice(0, CHAPTER_NAME_MAX_LEN)
      : undefined;

    const safeChapterIndex = Number.isInteger(Number(chapterIndex)) && Number(chapterIndex) >= 1
      ? Number(chapterIndex)
      : undefined;

    // Call Claude with the child-safe system prompt
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: getSystemPrompt(safeSubject, safeAgeLevel, safeLanguage, {
        grade: safeGrade,
        chapterName: safeChapterName,
        chapterIndex: safeChapterIndex,
      }),
      messages: [{ role: 'user', content: message }]
    });

    logUsage(safeSubject, safeAgeLevel, safeLanguage);

    const reply = response.content?.[0]?.text;
    if (!reply) {
      console.error('Claude returned no content');
      return res.status(500).json({ error: 'Failed to get response' });
    }
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
}
