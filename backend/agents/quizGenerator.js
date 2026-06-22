// Quiz Generator Agent
// Creates 3 age-appropriate multiple-choice questions for a subject.
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const generateQuiz = async (subject, ageLevel) => {
  const age = ageLevel === 'little' ? '6–10 years old' : '11–14 years old';
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 700,
    system: `You are a quiz creator for children aged ${age} in India learning ${subject}.
Generate exactly 3 fun multiple-choice questions at the right level.
Reply with ONLY valid JSON — no extra text:
{
  "questions": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "short, encouraging explanation (1 sentence)"
    }
  ]
}`,
    messages: [{ role: 'user', content: `Make a ${subject} quiz for a ${age} child in India.` }]
  });
  return JSON.parse(res.content[0].text);
};
