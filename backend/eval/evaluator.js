// EduBridge Evaluation Harness
// Sanity-checks that Claude gives age-appropriate answers to children.
// Run with:  npm run eval   (requires a valid ANTHROPIC_API_KEY in backend/.env)
//
// Each test case asks a real question and checks the answer:
//   mustContain    — words/phrases that SHOULD appear (correctness)
//   mustNotContain — jargon that should NOT appear (age-appropriateness)

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from '../prompts/systemPrompts.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TEST_CASES = [
  {
    subject: 'Math',
    ageLevel: 'little',
    question: 'What is 2 + 2?',
    mustContain: ['4'],
    mustNotContain: ['calculus', 'algebra', 'complex number']
  },
  {
    subject: 'Science',
    ageLevel: 'little',
    question: 'Why is the sky blue?',
    mustContain: [],
    mustNotContain: ['electromagnetic', 'wavelength theorem']
  },
  {
    subject: 'English',
    ageLevel: 'older',
    question: 'What is a noun?',
    // Any one of these everyday anchors is enough — a noun names a person/place/thing
    mustContainAny: ['person', 'place', 'thing'],
    mustContain: ['word'],
    mustNotContain: []
  }
];

export const runEvals = async () => {
  console.log('🧪 Running EduBridge Evaluation Harness...\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set. Add it to backend/.env and try again.');
    return { passed: 0, failed: TEST_CASES.length, total: TEST_CASES.length };
  }

  let passed = 0;
  let failed = 0;

  for (const test of TEST_CASES) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: getSystemPrompt(test.subject, test.ageLevel, 'english'),
        messages: [{ role: 'user', content: test.question }]
      });
      const answer = response.content[0].text.toLowerCase();

      const containsPassed = (test.mustContain || []).every(word =>
        answer.includes(word.toLowerCase())
      );
      const containsAnyPassed = !test.mustContainAny || test.mustContainAny.some(word =>
        answer.includes(word.toLowerCase())
      );
      const notContainsPassed = (test.mustNotContain || []).every(word =>
        !answer.includes(word.toLowerCase())
      );

      if (containsPassed && containsAnyPassed && notContainsPassed) {
        console.log(`✅ PASS: ${test.subject} (${test.ageLevel}) — "${test.question}"`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${test.subject} (${test.ageLevel}) — "${test.question}"`);
        if (!containsPassed) console.log(`   Missing required: ${JSON.stringify(test.mustContain)}`);
        if (!containsAnyPassed) console.log(`   Missing any-of: ${JSON.stringify(test.mustContainAny)}`);
        if (!notContainsPassed) console.log(`   Contains forbidden: ${JSON.stringify(test.mustNotContain)}`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ERROR: ${test.question} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`Score: ${Math.round((passed / TEST_CASES.length) * 100)}%`);
  return { passed, failed, total: TEST_CASES.length };
};

// Allow running directly:  node eval/evaluator.js
if (import.meta.url === `file://${process.argv[1]}`) {
  runEvals();
}
