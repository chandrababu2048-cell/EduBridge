// EduBridge — CANONICAL request-validation module (single source of truth).
//
// WHY THIS LIVES HERE: production runs on Vercel serverless functions under
// frontend/api/. Vercel's file tracing is only guaranteed to bundle files
// reachable from the frontend project root, so the canonical implementation
// must live inside frontend/. The repo-root `shared/` package re-exports this
// file, and the Express backend (local dev / VM only) imports it via `shared/`.
// Do NOT copy this logic anywhere else — import it.
//
// (Files under api/ that start with "_" are NOT treated as routes by Vercel.)

// Allowlists — these fields are interpolated into the system prompt, so they
// must be validated to prevent prompt injection.
export const VALID_SUBJECTS = [
  'Math',
  'Science',
  'English',
  'Civic Sense',
  'My Rights',
  'Respect & Safety',
  'Communication',
];
export const VALID_AGE_LEVELS = ['little', 'older'];
export const VALID_LANGUAGES = ['english', 'hindi', 'telugu', 'tamil', 'kannada', 'bengali', 'marathi'];
export const VALID_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Caps — protect API costs and the prompt from oversized inputs.
export const MAX_MESSAGE_LENGTH = 2000;
export const CHAPTER_NAME_MAX_LEN = 120;

/**
 * Validate and sanitize a chat request body.
 *
 * Returns either:
 *   { ok: true,  sanitized: { message, subject, ageLevel, language, grade, chapterName, chapterIndex } }
 *   { ok: false, error: '<human-readable message>' }
 *
 * Sanitization rules (the spec — mirrored by backend/__tests__/chat.test.js):
 * - message: required non-empty string, max MAX_MESSAGE_LENGTH chars.
 * - subject / ageLevel / language: allowlisted, with safe fallbacks
 *   ('Math' / 'little' / 'english') so a bad value can never reach the prompt.
 * - grade: integer 1–12, otherwise undefined (no NCERT context injected).
 * - chapterName: embedded verbatim in the system prompt — capped at
 *   CHAPTER_NAME_MAX_LEN and stripped of prompt-control characters.
 * - chapterIndex: integer >= 1, otherwise undefined.
 */
export function validateChatRequest(body) {
  const { message, subject, ageLevel, language, grade, chapterName, chapterIndex } = body || {};

  // The message is required and must be a non-empty string
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { ok: false, error: 'Message is required' };
  }

  // Reject messages that are unreasonably long to protect API costs
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.` };
  }

  const sanitized = {
    message,
    // Allowlist checks — fall back to safe defaults rather than rejecting,
    // so a child never sees an error because of a stale client.
    subject: VALID_SUBJECTS.includes(subject) ? subject : 'Math',
    ageLevel: VALID_AGE_LEVELS.includes(ageLevel) ? ageLevel : 'little',
    language: VALID_LANGUAGES.includes(language) ? language : 'english',
    // Grade must be an integer 1–12; anything else means "no NCERT context"
    grade: VALID_GRADES.includes(Number(grade)) ? Number(grade) : undefined,
    // chapterName is embedded verbatim in the system prompt — cap its length and
    // strip characters that could be used to inject prompt-control sequences.
    chapterName: typeof chapterName === 'string'
      ? chapterName.slice(0, CHAPTER_NAME_MAX_LEN).replace(/[<>{}[\]\\]/g, '').trim()
      : undefined,
    chapterIndex: Number.isInteger(Number(chapterIndex)) && Number(chapterIndex) >= 1
      ? Number(chapterIndex)
      : undefined,
  };

  return { ok: true, sanitized };
}
