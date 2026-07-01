// POST /api/agents/safety-check — child-safety pre-screen (Vercel Serverless Function).
//
// The frontend calls this before every question. Previously this route only
// existed on the Express backend, so in production (pure Vercel) it returned
// 404 and the frontend failed open — children's messages were NOT pre-screened.
// This function closes that gap.
//
// Returns { status: 'safe' | 'distress' | 'inappropriate' }.
// Fail-open: any internal error returns { status: 'safe' } so a monitor outage
// never blocks a child's learning question.
import { checkMessageSafety } from '../_lib/safetyMonitor.js';
import { VALID_AGE_LEVELS, MAX_MESSAGE_LENGTH } from '../_lib/validation.js';

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
    const { message, ageLevel } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message required' });
    }

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many questions! Please wait a minute 😊' });
    }

    // Sanitize inputs: allowlist ageLevel, cap message length (the chat
    // endpoint rejects >2000 chars anyway, so never spend tokens beyond that).
    const safeAgeLevel = VALID_AGE_LEVELS.includes(ageLevel) ? ageLevel : 'little';
    const result = await checkMessageSafety(
      message.trim().slice(0, MAX_MESSAGE_LENGTH),
      safeAgeLevel
    );
    return res.status(200).json(result);
  } catch (err) {
    // Fail-open — never block a child because the monitor itself broke.
    console.error('Safety check error:', err);
    return res.status(200).json({ status: 'safe' });
  }
}
