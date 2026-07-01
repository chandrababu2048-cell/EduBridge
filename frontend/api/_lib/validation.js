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
export const MAX_HISTORY_ENTRIES = 10;

/**
 * Sanitize an optional conversation history (multi-turn memory).
 *
 * Philosophy: a corrupted history must NEVER block a child's question, so
 * invalid input is stripped (treated as no history) rather than rejected.
 *
 * Rules:
 * - Not an array → [] (no history).
 * - Each entry must be { role: 'user'|'assistant', text: non-empty string
 *   ≤ MAX_MESSAGE_LENGTH }; anything else is dropped.
 * - The Claude API requires strictly alternating user/assistant turns, and the
 *   new question is appended as a 'user' turn after this history. So we keep
 *   only well-formed [user, assistant] pairs, scanning from the most recent
 *   entry backwards (a reply pairs with the message immediately before it);
 *   entries that break pairing (consecutive same-role turns, a dangling
 *   trailing user turn) are dropped.
 * - Trimmed to the last MAX_HISTORY_ENTRIES entries (pair-aligned, since the
 *   cap is even and the list is made of whole pairs).
 *
 * The result is guaranteed to be empty or to start with 'user', alternate
 * strictly, and end with 'assistant' — always valid to prepend to the new
 * user message.
 */
export function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  // 1. Drop entries with a bad shape, role, or text.
  const typed = history.filter(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      (entry.role === 'user' || entry.role === 'assistant') &&
      typeof entry.text === 'string' &&
      entry.text.trim() !== '' &&
      entry.text.length <= MAX_MESSAGE_LENGTH
  );

  // 2. Coerce to valid alternation: keep only complete user→assistant pairs,
  //    walking from the end so the most recent exchanges win.
  const pairs = [];
  for (let i = typed.length - 1; i >= 1; ) {
    if (typed[i].role === 'assistant' && typed[i - 1].role === 'user') {
      pairs.unshift(
        { role: 'user', text: typed[i - 1].text },
        { role: 'assistant', text: typed[i].text }
      );
      i -= 2;
    } else {
      // This entry breaks alternation (repeated role / dangling user turn) —
      // skip it and keep scanning.
      i -= 1;
    }
  }

  // 3. Cap the total history length (most recent pairs win).
  return pairs.slice(-MAX_HISTORY_ENTRIES);
}

/**
 * Validate and sanitize a chat request body.
 *
 * Returns either:
 *   { ok: true,  sanitized: { message, subject, ageLevel, language, grade, chapterName, chapterIndex, history } }
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
 * - history: optional multi-turn memory — sanitized by sanitizeHistory()
 *   (invalid/oversized history is stripped, never rejected).
 */
export function validateChatRequest(body) {
  const { message, subject, ageLevel, language, grade, chapterName, chapterIndex, history } = body || {};

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
    // Conversation memory — always a valid (possibly empty) alternating list.
    history: sanitizeHistory(history),
  };

  return { ok: true, sanitized };
}
