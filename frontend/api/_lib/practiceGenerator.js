// EduBridge — CANONICAL practice-question generator (single source of truth).
//
// Doubt-to-mastery: after the tutor explains a concept, this module generates
// 2 quick multiple-choice questions so the child can prove they learned it.
//
// WHY THIS LIVES HERE: production runs on Vercel serverless functions under
// frontend/api/. Vercel's file tracing is only guaranteed to bundle files
// reachable from the frontend project root, so the canonical implementation
// must live inside frontend/. The repo-root `shared/practice.js` re-exports
// this file for the Express backend (local dev / VM only).
// Do NOT copy this logic anywhere else — import it.
//
// (Files under api/ that start with "_" are NOT treated as routes by Vercel.)

export const PRACTICE_MODEL = 'claude-sonnet-4-6';
export const PRACTICE_MAX_TOKENS = 800;

// Human-readable language names for the generation prompt. The `language`
// value is allowlisted by validatePracticeRequest before it gets here.
const LANGUAGE_NAMES = {
  english: 'English',
  hindi: 'Hindi',
  telugu: 'Telugu',
  tamil: 'Tamil',
  kannada: 'Kannada',
  bengali: 'Bengali',
  marathi: 'Marathi',
};

/**
 * Build the system prompt for the practice-question generator.
 * All interpolated values (subject, ageLevel, language, grade) are already
 * allowlist-validated; the child's free text goes in the USER message, never here.
 */
export function buildPracticeSystemPrompt({ subject, ageLevel, language, grade }) {
  const age = ageLevel === 'little' ? '6 to 10 years old' : '11 to 14 years old';
  const langName = LANGUAGE_NAMES[language] ?? 'English';
  const gradeContext = grade ? ` The child is in Class ${grade} (CBSE/NCERT level).` : '';

  return `You are a quiz generator for EduBridge, a free tutoring app for underprivileged Indian children.

A child just had a ${subject} concept explained to them. Generate EXACTLY 2 multiple-choice practice questions that test the SAME concept, so the child can prove they understood it.

Rules:
- The child is ${age}.${gradeContext} Keep questions at their level — simple words, short sentences.
- Write ALL questions and ALL options in ${langName} only.
- Each question has EXACTLY 3 options with EXACTLY ONE correct answer.
- Wrong options must be plausible but clearly incorrect — never trick questions.
- Keep each question under 25 words and each option under 10 words.

Respond ONLY with JSON matching this exact shape — no markdown, no explanation, no extra keys:
{ "questions": [ { "question": "...", "options": ["...", "...", "..."], "correctIndex": 0 } ] }
"correctIndex" is the 0-based index (0, 1, or 2) of the correct option.`;
}

/**
 * Build the user message: the child's original question plus (optionally)
 * the tutor's explanation, so the questions match what was actually taught.
 */
export function buildPracticeUserMessage({ concept, answerText }) {
  const explanation = answerText
    ? `\n\nThe tutor explained it like this:\n"""\n${answerText}\n"""`
    : '';
  return `The child asked:\n"""\n${concept}\n"""${explanation}\n\nGenerate the 2 practice questions now (JSON only).`;
}

/**
 * Parse the model's response into a validated questions array.
 *
 * Robustness rules (the model can misbehave — we never throw):
 * - Strips markdown code fences (``` / ```json) if present.
 * - JSON.parse in try/catch — any parse failure returns [].
 * - Shape check per question: non-empty string `question`, EXACTLY 3 non-empty
 *   string options, integer correctIndex 0–2. Offending questions are dropped.
 * - Exactly 2 questions is preferred but 1–3 are accepted (capped at 3).
 * - If nothing survives, returns [] — the frontend skips practice silently.
 */
export function parsePracticeQuestions(text) {
  if (typeof text !== 'string' || text.trim() === '') return [];

  // Strip markdown fences: ```json ... ``` or ``` ... ```
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return [];
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.questions)) return [];

  const valid = parsed.questions.filter(
    (q) =>
      q &&
      typeof q === 'object' &&
      typeof q.question === 'string' &&
      q.question.trim() !== '' &&
      Array.isArray(q.options) &&
      q.options.length === 3 &&
      q.options.every((o) => typeof o === 'string' && o.trim() !== '') &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex <= 2
  );

  // Keep only the whitelisted fields (never echo unknown model keys onward).
  return valid.slice(0, 3).map((q) => ({
    question: q.question.trim(),
    options: q.options.map((o) => o.trim()),
    correctIndex: q.correctIndex,
  }));
}

/**
 * Call Claude and return a validated questions array.
 *
 * FAIL-SOFT BY DESIGN: practice is a bonus on top of the tutor's answer, so
 * it must never break the chat flow. Any API error, parse failure, or shape
 * failure returns [] — the caller responds 200 { questions: [] } and the
 * frontend silently skips the practice card.
 */
export async function generatePracticeQuestions(anthropic, sanitized) {
  try {
    const response = await anthropic.messages.create({
      model: PRACTICE_MODEL,
      max_tokens: PRACTICE_MAX_TOKENS,
      system: buildPracticeSystemPrompt(sanitized),
      messages: [{ role: 'user', content: buildPracticeUserMessage(sanitized) }],
    });
    return parsePracticeQuestions(response.content?.[0]?.text ?? '');
  } catch (error) {
    console.error('Practice generation error:', error);
    return [];
  }
}
