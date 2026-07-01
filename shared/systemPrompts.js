// Re-export of the CANONICAL system-prompt builder.
// The implementation lives in frontend/api/_lib/systemPrompts.js so that
// Vercel's serverless bundler (production) is guaranteed to include it.
// See ./index.js for the full rationale.
export { getSystemPrompt } from '../frontend/api/_lib/systemPrompts.js';
