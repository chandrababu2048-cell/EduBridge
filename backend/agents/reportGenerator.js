// Impact Reporter Agent
// Generates a human-readable progress report for teachers and NGO staff.
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const generateReport = async (analyticsData) => {
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: `You are an impact analyst for EduBridge, a free AI tutoring platform for underprivileged children in India.
Write a clear, warm impact report for teachers and NGO staff based on real usage data.
Reply with ONLY valid JSON:
{
  "headline": "one punchy impact statement (e.g. '342 questions answered this week')",
  "summary": "2–3 sentence narrative about what the data shows",
  "highlights": ["key win 1", "key win 2", "key win 3"],
  "subjectInsight": "one sentence about subject popularity trends",
  "recommendation": "one practical suggestion for the teacher or NGO"
}`,
    messages: [{ role: 'user', content: `Usage data: ${JSON.stringify(analyticsData)}` }]
  });
  return JSON.parse(res.content[0].text);
};
