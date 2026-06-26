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

// Prevent logUsage from trying to write files during chat tests
vi.mock('../routes/analytics.js', () => ({
  logUsage: vi.fn(),
}));

import chatRouter from '../routes/chat.js';

const app = express();
app.use(express.json());
app.use('/api', chatRouter);

describe('POST /api/chat — input validation', () => {
  it('returns 400 when message is missing', async () => {
    const res = await request(app).post('/api/chat').send({ subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Message is required');
  });

  it('returns 400 when message is an empty string', async () => {
    const res = await request(app).post('/api/chat').send({ message: '', subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Message is required');
  });

  it('returns 400 when message is whitespace only', async () => {
    const res = await request(app).post('/api/chat').send({ message: '   ', subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is not a string', async () => {
    const res = await request(app).post('/api/chat').send({ message: 42, subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when message exceeds 2000 characters', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'a'.repeat(2001), subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('too long');
  });
});

describe('POST /api/chat — successful response', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with Claude reply on a valid request', async () => {
    mockCreate.mockResolvedValue({ content: [{ text: 'Two plus two is four! 🌟' }] });
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'What is 2+2?', subject: 'Math', ageLevel: 'little', language: 'english' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Two plus two is four! 🌟');
  });

  it('forwards the correct model and token limit to the Claude API', async () => {
    mockCreate.mockResolvedValue({ content: [{ text: 'Hello!' }] });
    await request(app)
      .post('/api/chat')
      .send({ message: 'Hello', subject: 'Science', ageLevel: 'older', language: 'english' });
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-sonnet-4-6');
    expect(callArgs.max_tokens).toBe(1024);
  });

  it('passes the child message as the user turn', async () => {
    mockCreate.mockResolvedValue({ content: [{ text: 'Answer' }] });
    await request(app)
      .post('/api/chat')
      .send({ message: 'Why is the sky blue?', subject: 'Science', ageLevel: 'little', language: 'english' });
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].role).toBe('user');
    expect(callArgs.messages[0].content).toBe('Why is the sky blue?');
  });
});

describe('POST /api/chat — error handling', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 500 when the Claude API throws', async () => {
    mockCreate.mockRejectedValue(new Error('API unavailable'));
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'What is math?', subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to get response');
  });

  it('returns 500 when Claude returns an empty content array', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'What is math?', subject: 'Math', ageLevel: 'little' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to get response');
  });
});

describe('POST /api/chat — allowlist validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('falls back to Math when an invalid subject is sent', async () => {
    mockCreate.mockResolvedValue({ content: [{ text: 'Answer' }] });
    await request(app)
      .post('/api/chat')
      .send({ message: 'Hello', subject: 'HACKED; rm -rf /', ageLevel: 'little', language: 'english' });
    const callArgs = mockCreate.mock.calls[0][0];
    // The system prompt must contain "Math" and NOT contain the injected string
    expect(callArgs.system).toContain('Math');
    expect(callArgs.system).not.toContain('rm -rf');
  });

  it('falls back to english when an invalid language is sent', async () => {
    mockCreate.mockResolvedValue({ content: [{ text: 'Answer' }] });
    await request(app)
      .post('/api/chat')
      .send({ message: 'Hello', subject: 'Math', ageLevel: 'little', language: 'klingon' });
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system).toContain('ENGLISH ONLY');
  });

  it('truncates chapterName to 120 characters', async () => {
    mockCreate.mockResolvedValue({ content: [{ text: 'Answer' }] });
    const longChapter = 'A'.repeat(200);
    await request(app)
      .post('/api/chat')
      .send({ message: 'Hello', subject: 'Math', ageLevel: 'little', language: 'english', grade: 7, chapterName: longChapter, chapterIndex: 1 });
    const callArgs = mockCreate.mock.calls[0][0];
    // The chapter name in the system prompt must be truncated to 120 chars
    expect(callArgs.system).toContain('A'.repeat(120));
    expect(callArgs.system).not.toContain('A'.repeat(121));
  });

  it('ignores out-of-range grade values', async () => {
    mockCreate.mockResolvedValue({ content: [{ text: 'Answer' }] });
    await request(app)
      .post('/api/chat')
      .send({ message: 'Hello', subject: 'Math', ageLevel: 'little', language: 'english', grade: 99 });
    const callArgs = mockCreate.mock.calls[0][0];
    // No NCERT context should be injected for invalid grade
    expect(callArgs.system).not.toContain('Class 99');
  });
});
