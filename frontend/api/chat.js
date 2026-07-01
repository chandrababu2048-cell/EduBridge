// POST /api/chat — the main tutoring endpoint (Vercel Serverless Function).
// Replaces the Express backend for production. Calls the Claude API with a
// child-friendly system prompt and returns a simple answer.
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import { getSystemPrompt } from './_lib/systemPrompts.js';
import { validateChatRequest } from './_lib/validation.js';
import { logUsageEvent } from './_lib/usageStore.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

// --- Best-effort usage logging (two layers) ---
// 1. Durable: logUsageEvent() inserts a zero-PII row into Supabase
//    (usage_events) — feeds the real /api/public/stats numbers.
// 2. Local: /tmp counters (the only writable path on Vercel) power the
//    per-instance /api/analytics/stats breakdown. Approximate; resets on
//    cold starts. Neither layer can ever break or delay the chat reply.
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
    // Validate + sanitize the request body (shared canonical logic — see _lib/validation.js)
    const result = validateChatRequest(req.body);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    const { message, subject, ageLevel, language, grade, chapterName, chapterIndex, history, image } = result.sanitized;

    // Kid-friendly rate-limit message
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many questions! Please wait a minute 😊' });
    }

    // Photo-a-problem: when a validated image is attached, the final user turn
    // becomes a content-block array (image first, then the question) so Claude
    // vision can read the problem off the photo. History stays plain text —
    // images are never echoed back into history (cost + validation strips them).
    const userContent = image
      ? [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
          { type: 'text', text: message },
        ]
      : message;

    // Call Claude with the child-safe system prompt.
    // Conversation memory: the sanitized history is guaranteed to be a valid
    // alternating user/assistant list ending with 'assistant' (or empty), so
    // appending the new user message always produces a valid messages array.
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: getSystemPrompt(subject, ageLevel, language, { grade, chapterName, chapterIndex, hasImage: Boolean(image) }),
      messages: [
        ...history.map(({ role, text }) => ({ role, content: text })),
        { role: 'user', content: userContent },
      ]
    });

    // Fire-and-forget analytics — deliberately NOT awaited so the child's
    // answer is never delayed; logUsageEvent swallows its own errors.
    logUsageEvent({ subject, ageLevel, language, grade });
    logUsage(subject, ageLevel, language);

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
