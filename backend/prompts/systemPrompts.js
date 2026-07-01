// EduBridge System Prompts — thin re-export shim.
//
// The CANONICAL implementation lives in frontend/api/_lib/systemPrompts.js
// (re-exported via the repo-root shared/ package). It lives there because
// production runs on Vercel serverless functions, whose bundler is only
// guaranteed to trace files inside the frontend project root. This shim keeps
// existing backend imports working without duplicating the prompt.
export { getSystemPrompt } from '../../shared/systemPrompts.js';
