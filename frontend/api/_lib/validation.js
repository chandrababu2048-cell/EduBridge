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

// --- Photo-a-problem (vision) ---
// Image types Claude vision accepts AND the frontend file picker offers.
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Base64 character cap for the image payload. Vercel serverless functions
// reject request bodies over ~4.5MB, so the CLIENT caps uploads at 3MB of
// binary (≈ 4.1M base64 chars after the 4/3 inflation). This server-side cap
// (4.2M chars) sits just above the client cap — enough headroom for the rest
// of the JSON body while staying safely under Vercel's 4.5MB body limit.
export const MAX_IMAGE_BASE64_CHARS = 4_200_000;
// Default question when a child sends a photo with no text — they may not be
// able to type the problem (that's the whole point of the feature).
export const DEFAULT_IMAGE_QUESTION = 'Can you explain this problem to me?';

/**
 * Validate an optional image attachment ({ data: base64 string, mediaType }).
 *
 * Unlike history (which is silently stripped), a broken image FAILS the
 * request: the child pressed "send" expecting the photo to be read, and a
 * silent strip would return an answer to nothing. Failing loudly lets the
 * client show a friendly retry message instead.
 *
 * Returns { ok: true, image: {...}|undefined } or { ok: false }.
 */
export function validateImage(image) {
  if (image === undefined || image === null) return { ok: true, image: undefined };
  if (typeof image !== 'object' || Array.isArray(image)) return { ok: false };

  const { data, mediaType } = image;
  if (!VALID_IMAGE_TYPES.includes(mediaType)) return { ok: false };
  if (typeof data !== 'string' || data.length === 0) return { ok: false };
  if (data.length > MAX_IMAGE_BASE64_CHARS) return { ok: false };

  // Sanity-check the base64 alphabet on a sample. Running the regex over the
  // full ~4MB string would work fine in Node, but the first 1000 chars are
  // enough to catch the realistic failure modes (a data: URL prefix left in,
  // raw binary, JSON garbage) — the Claude API is the final arbiter anyway.
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data.slice(0, 1000))) return { ok: false };

  return { ok: true, image: { data, mediaType } };
}

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
 *   { ok: true,  sanitized: { message, subject, ageLevel, language, grade, chapterName, chapterIndex, history, image } }
 *   { ok: false, error: '<human-readable message>' }
 *
 * Sanitization rules (the spec — mirrored by backend/__tests__/chat.test.js):
 * - message: required non-empty string, max MAX_MESSAGE_LENGTH chars —
 *   EXCEPT when a valid image is attached, in which case an empty message is
 *   replaced with DEFAULT_IMAGE_QUESTION (photo-a-problem).
 * - image: optional { data: base64, mediaType } — validated by validateImage();
 *   a malformed/oversized image REJECTS the request with 'Invalid image'.
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
  const { message, subject, ageLevel, language, grade, chapterName, chapterIndex, history, image } = body || {};

  // Optional image attachment (photo-a-problem). Validated FIRST because it
  // decides whether an empty message is acceptable. A malformed image rejects
  // the whole request — see validateImage() for why it fails loudly.
  const imageResult = validateImage(image);
  if (!imageResult.ok) {
    return { ok: false, error: 'Invalid image' };
  }

  // The message is required and must be a non-empty string — UNLESS a valid
  // image is attached, in which case an empty message is fine (a child who
  // can't type the problem just sends the photo) and we substitute a default
  // question so Claude knows what to do with the image.
  if (message !== undefined && message !== null && typeof message !== 'string') {
    return { ok: false, error: 'Message is required' };
  }
  const hasText = typeof message === 'string' && message.trim() !== '';
  if (!hasText && !imageResult.image) {
    return { ok: false, error: 'Message is required' };
  }

  // Reject messages that are unreasonably long to protect API costs
  if (hasText && message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.` };
  }

  const sanitized = {
    message: hasText ? message : DEFAULT_IMAGE_QUESTION,
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
    // Optional validated photo attachment — undefined when none was sent.
    image: imageResult.image,
  };

  return { ok: true, sanitized };
}
