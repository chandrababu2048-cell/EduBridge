// Re-export of the CANONICAL practice-question generator (doubt-to-mastery).
// The implementation lives in frontend/api/_lib/practiceGenerator.js so that
// Vercel's serverless bundler (production) is guaranteed to include it.
// See ./index.js for the full rationale.
export {
  PRACTICE_MODEL,
  PRACTICE_MAX_TOKENS,
  buildPracticeSystemPrompt,
  buildPracticeUserMessage,
  parsePracticeQuestions,
  generatePracticeQuestions,
} from '../frontend/api/_lib/practiceGenerator.js';
