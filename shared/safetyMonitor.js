// Re-export of the CANONICAL child-safety monitor.
// The implementation lives in frontend/api/_lib/safetyMonitor.js so that
// Vercel's serverless bundler (production) is guaranteed to include it.
// See ./index.js for the full rationale.
export {
  createSafetyChecker,
  checkMessageSafety,
  SAFETY_STATUSES,
  SAFETY_MODEL,
} from '../frontend/api/_lib/safetyMonitor.js';
