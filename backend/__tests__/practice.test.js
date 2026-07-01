// Tests for POST /api/practice — doubt-to-mastery practice questions.
//
// The endpoint's contract is FAIL-SOFT: only invalid client input (missing/
// oversized concept) may 400; ANY model misbehaviour (malformed JSON, wrong
// shape) or Claude API error must return 200 { questions: [] } so the chat
// flow is never broken by the practice bonus.
import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// mockCreate must be hoisted so the Anthropic mock factory can reference it
const mockCreate = vi.hoisted(() => vi.fn());

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    constructor() {
      this.messages = { create: mockCreate };
    }
  },
}));

import practiceRouter from '../routes/practice.js';

const app = express();
app.use(express.json());
app.use('/api', practiceRouter);

// A valid model response with exactly 2 questions (the happy path)
const twoQuestions = {
  questions: [
    { question: 'What is 2+2?', options: ['3', '4', '5'], correctIndex: 1 },
    { question: 'What is 3+3?', options: ['6', '7', '8'], correctIndex: 0 },
  ],
};

/** Mock Claude returning the given text, then POST a valid practice request. */
async function sendWithModelText(text, body = {}) {
  mockCreate.mockResolvedValue({ content: [{ text }] });
  const res = await request(app)
    .post('/api/practice')
    .send({
      concept: 'What is addition?',
      answerText: 'Addition means putting numbers together!',
      subject: 'Math',
      ageLevel: 'little',
      language: 'english',
      ...body,
    });
  return { res, callArgs: mockCreate.mock.calls[0]?.[0] };
}

describe('POST /api/practice — input validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 when concept is missing', async () => {
    const res = await request(app).post('/api/practice').send({ subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Concept is required');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when concept is an empty/whitespace string', async () => {
    const res = await request(app).post('/api/practice').send({ concept: '   ', subject: 'Math' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Concept is required');
  });

  it('returns 400 when concept is not a string', async () => {
    const res = await request(app).post('/api/practice').send({ concept: 42, subject: 'Math' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when concept exceeds 2000 characters', async () => {
    const res = await request(app)
      .post('/api/practice')
      .send({ concept: 'a'.repeat(2001), subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('too long');
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('POST /api/practice — successful generation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with 2 parsed questions when the model returns valid JSON', async () => {
    const { res } = await sendWithModelText(JSON.stringify(twoQuestions));
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(2);
    expect(res.body.questions[0]).toEqual({
      question: 'What is 2+2?',
      options: ['3', '4', '5'],
      correctIndex: 1,
    });
    expect(res.body.questions[1].correctIndex).toBe(0);
  });

  it('forwards the practice model and 800-token limit to the Claude API', async () => {
    const { callArgs } = await sendWithModelText(JSON.stringify(twoQuestions));
    expect(callArgs.model).toBe('claude-sonnet-4-6');
    expect(callArgs.max_tokens).toBe(800);
  });

  it('includes the concept and the tutor explanation in the user message', async () => {
    const { callArgs } = await sendWithModelText(JSON.stringify(twoQuestions));
    expect(callArgs.messages[0].role).toBe('user');
    expect(callArgs.messages[0].content).toContain('What is addition?');
    expect(callArgs.messages[0].content).toContain('Addition means putting numbers together!');
  });

  it('parses JSON wrapped in ```json markdown fences', async () => {
    const fenced = '```json\n' + JSON.stringify(twoQuestions) + '\n```';
    const { res } = await sendWithModelText(fenced);
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(2);
    expect(res.body.questions[0].question).toBe('What is 2+2?');
  });

  it('parses JSON wrapped in bare ``` fences', async () => {
    const fenced = '```\n' + JSON.stringify(twoQuestions) + '\n```';
    const { res } = await sendWithModelText(fenced);
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(2);
  });
});

describe('POST /api/practice — fail-soft on model misbehaviour', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 { questions: [] } for malformed JSON', async () => {
    const { res } = await sendWithModelText('Sure! Here are your questions: 1) What is...');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ questions: [] });
  });

  it('returns 200 { questions: [] } when the model returns empty content', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    const res = await request(app)
      .post('/api/practice')
      .send({ concept: 'What is addition?', subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ questions: [] });
  });

  it('drops questions with 4 options but keeps valid ones', async () => {
    const mixed = {
      questions: [
        { question: 'Bad one', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
        { question: 'Good one', options: ['a', 'b', 'c'], correctIndex: 2 },
      ],
    };
    const { res } = await sendWithModelText(JSON.stringify(mixed));
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(1);
    expect(res.body.questions[0].question).toBe('Good one');
  });

  it('drops questions with an out-of-range correctIndex', async () => {
    const bad = {
      questions: [
        { question: 'Q1', options: ['a', 'b', 'c'], correctIndex: 5 },
        { question: 'Q2', options: ['a', 'b', 'c'], correctIndex: -1 },
        { question: 'Q3', options: ['a', 'b', 'c'], correctIndex: 1.5 },
      ],
    };
    const { res } = await sendWithModelText(JSON.stringify(bad));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ questions: [] });
  });

  it('drops questions with empty option strings or an empty question', async () => {
    const bad = {
      questions: [
        { question: 'Q1', options: ['a', '', 'c'], correctIndex: 0 },
        { question: '   ', options: ['a', 'b', 'c'], correctIndex: 0 },
      ],
    };
    const { res } = await sendWithModelText(JSON.stringify(bad));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ questions: [] });
  });

  it('returns 200 { questions: [] } when questions is not an array', async () => {
    const { res } = await sendWithModelText(JSON.stringify({ questions: 'none' }));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ questions: [] });
  });

  it('accepts a single valid question (1–3 allowed)', async () => {
    const one = { questions: [twoQuestions.questions[0]] };
    const { res } = await sendWithModelText(JSON.stringify(one));
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(1);
  });

  it('caps an over-eager model at 3 questions', async () => {
    const many = { questions: Array.from({ length: 5 }, () => twoQuestions.questions[0]) };
    const { res } = await sendWithModelText(JSON.stringify(many));
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(3);
  });
});

describe('POST /api/practice — allowlist fallbacks', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('falls back to Math when an invalid subject is sent', async () => {
    const { callArgs } = await sendWithModelText(JSON.stringify(twoQuestions), {
      subject: 'HACKED; rm -rf /',
    });
    // The system prompt must contain "Math" and NOT the injected string
    expect(callArgs.system).toContain('Math');
    expect(callArgs.system).not.toContain('rm -rf');
  });

  it('falls back to English when an invalid language is sent', async () => {
    const { callArgs } = await sendWithModelText(JSON.stringify(twoQuestions), {
      language: 'klingon',
    });
    expect(callArgs.system).toContain('in English only');
  });

  it('ignores out-of-range grade values', async () => {
    const { callArgs } = await sendWithModelText(JSON.stringify(twoQuestions), { grade: 99 });
    expect(callArgs.system).not.toContain('Class 99');
  });

  it('includes the NCERT grade context for a valid grade', async () => {
    const { callArgs } = await sendWithModelText(JSON.stringify(twoQuestions), { grade: 7 });
    expect(callArgs.system).toContain('Class 7');
  });
});

describe('POST /api/practice — fail-soft on API errors', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 { questions: [] } when the Claude API throws', async () => {
    mockCreate.mockRejectedValue(new Error('API unavailable'));
    const res = await request(app)
      .post('/api/practice')
      .send({ concept: 'What is addition?', subject: 'Math', ageLevel: 'little', language: 'english' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ questions: [] });
  });
});
