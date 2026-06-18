// Study Planner Agent
// Looks at what the child has been studying and recommends what to do next.
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const getStudyPlan = async (stats, ageLevel) => {
  const age = ageLevel === 'little' ? '6–10 years old' : '11–14 years old';
  const bySubject = Object.entries(stats.bySubject || {})
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${s}: ${n} questions`)
    .join(', ') || 'none yet';

  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: `You are an encouraging study coach for a child aged ${age} learning on EduBridge in India.
Based on their activity, give a warm, motivating study plan.
Reply with ONLY valid JSON:
{
  "message": "one warm encouraging sentence personalised to their activity",
  "strengths": ["subject they've done most"],
  "nextSteps": [
    { "subject": "...", "tip": "one short actionable suggestion", "emoji": "..." },
    { "subject": "...", "tip": "...", "emoji": "..." }
  ]
}`,
    messages: [{
      role: 'user',
      content: `Total questions: ${stats.totalQuestions}. Streak: ${stats.streak || 0}. By subject: ${bySubject}.`
    }]
  });
  return JSON.parse(res.content[0].text);
};
