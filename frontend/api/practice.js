// POST /api/practice — doubt-to-mastery practice questions (Vercel Serverless Function).
//
// After the tutor answers a question, the frontend calls this endpoint to
// generate 2 quick multiple-choice questions testing the same concept, so
// the child can prove they learned it.
//
// FAIL-SOFT: practice is a bonus, never a blocker. Model misbehaviour
// (bad JSON, wrong shape) or a Claude API error returns 200 { questions: [] }
// and the frontend silently skips the practice card. Only invalid CLIENT
// input (missing/oversized concept) gets a 400.
import Anthropic from '@anthropic-ai/sdk';
import { validatePracticeRequest } from './_lib/validation.js';
import { generatePracticeQuestions } from './_lib/practiceGenerator.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// --- Best-effort rate limit (per warm instance) ---
// Same pattern as api/chat.js: protects the API key from runaway loops.
// Serverless instances are short-lived, so this is a safety net, not a hard
// global guarantee.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate + sanitize the request body (shared canonical logic)
    const result = validatePracticeRequest(req.body);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many questions! Please wait a minute 😊' });
    }

    // Fail-soft by construction: generatePracticeQuestions never throws —
    // any model/API failure comes back as an empty array.
    const questions = await generatePracticeQuestions(anthropic, result.sanitized);
    return res.status(200).json({ questions });
  } catch (error) {
    // Belt-and-braces: even an unexpected error must not surface as a 500 —
    // the chat reply already succeeded; practice just silently skips.
    console.error('Practice endpoint error:', error);
    return res.status(200).json({ questions: [] });
  }
}
