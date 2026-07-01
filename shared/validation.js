// Re-export of the CANONICAL chat-request validation module.
// The implementation lives in frontend/api/_lib/validation.js so that
// Vercel's serverless bundler (production) is guaranteed to include it.
// See ./index.js for the full rationale.
export {
  VALID_SUBJECTS,
  VALID_AGE_LEVELS,
  VALID_LANGUAGES,
  VALID_GRADES,
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_ENTRIES,
  CHAPTER_NAME_MAX_LEN,
  validateChatRequest,
  sanitizeHistory,
} from '../frontend/api/_lib/validation.js';
