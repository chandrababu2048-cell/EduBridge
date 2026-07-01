// edubridge-shared — single import point for logic used by BOTH deployments:
//   - frontend/api/*  (Vercel serverless functions — PRODUCTION)
//   - backend/*       (Express server — local dev / optional VM hosting)
//
// DIRECTION OF TRUTH: the canonical implementations live in
// frontend/api/_lib/ because Vercel's serverless file tracing is only
// guaranteed to bundle files inside the frontend project root — importing
// from outside frontend/ could break the production deploy. This package
// re-exports them so the backend (which runs from a full repo checkout and
// can safely reach across directories) has one stable import path.
//
// Rule: never duplicate this logic. Import from 'shared/' (backend) or
// './_lib/' (serverless functions).
export { getSystemPrompt } from './systemPrompts.js';
export {
  VALID_SUBJECTS,
  VALID_AGE_LEVELS,
  VALID_LANGUAGES,
  VALID_GRADES,
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_ENTRIES,
  CHAPTER_NAME_MAX_LEN,
  VALID_IMAGE_TYPES,
  MAX_IMAGE_BASE64_CHARS,
  DEFAULT_IMAGE_QUESTION,
  validateChatRequest,
  validateImage,
} from './validation.js';
export {
  createSafetyChecker,
  checkMessageSafety,
  SAFETY_STATUSES,
  SAFETY_MODEL,
} from './safetyMonitor.js';
export {
  logUsageEvent,
  getQuestionsAnsweredCount,
} from './usageStore.js';
