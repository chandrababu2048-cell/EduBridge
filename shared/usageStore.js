// Re-export of the CANONICAL usage-analytics store.
// The implementation lives in frontend/api/_lib/usageStore.js so that
// Vercel's serverless bundler (production) is guaranteed to include it.
// See ./index.js for the full rationale.
export {
  logUsageEvent,
  getQuestionsAnsweredCount,
  _resetUsageStoreForTests,
} from '../frontend/api/_lib/usageStore.js';
