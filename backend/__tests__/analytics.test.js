import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// fsState is hoisted so the vi.mock factory below can safely close over it
const fsState = vi.hoisted(() => ({ data: null }));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => fsState.data !== null),
    readFileSync: vi.fn(() => fsState.data),
    writeFileSync: vi.fn((_, content) => { fsState.data = content; }),
    mkdirSync: vi.fn(),
  },
}));

import { logUsage } from '../routes/analytics.js';
import analyticsRouter from '../routes/analytics.js';

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRouter);

describe('logUsage', () => {
  beforeEach(() => { fsState.data = null; });

  it('records totalQuestions = 1 on the first call', () => {
    logUsage('Math', 'little', 'english');
    const saved = JSON.parse(fsState.data);
    expect(saved.totalQuestions).toBe(1);
  });

  it('records the correct subject, age, and language buckets', () => {
    logUsage('Science', 'older', 'telugu');
    const saved = JSON.parse(fsState.data);
    expect(saved.bySubject.Science).toBe(1);
    expect(saved.byAge.older).toBe(1);
    expect(saved.byLanguage.telugu).toBe(1);
  });

  it('increments counts across multiple calls', () => {
    logUsage('Math', 'little', 'english');
    logUsage('Math', 'little', 'english');
    const saved = JSON.parse(fsState.data);
    expect(saved.totalQuestions).toBe(2);
    expect(saved.bySubject.Math).toBe(2);
  });

  it('tracks different subjects independently', () => {
    logUsage('Math', 'little', 'english');
    logUsage('Science', 'little', 'english');
    const saved = JSON.parse(fsState.data);
    expect(saved.bySubject.Math).toBe(1);
    expect(saved.bySubject.Science).toBe(1);
  });

  it('records today\'s date in byDate', () => {
    logUsage('Math', 'little', 'english');
    const saved = JSON.parse(fsState.data);
    const today = new Date().toISOString().split('T')[0];
    expect(saved.byDate[today]).toBe(1);
  });

  it('does not throw when subject, ageLevel, or language are undefined', () => {
    expect(() => logUsage(undefined, undefined, undefined)).not.toThrow();
  });

  it('does not throw on a second call when the first wrote data', () => {
    logUsage('Math', 'little', 'english');
    expect(() => logUsage('Math', 'little', 'english')).not.toThrow();
  });
});

describe('GET /api/analytics/stats', () => {
  beforeEach(() => { fsState.data = null; });

  it('returns empty stats when no usage file exists', async () => {
    const res = await request(app).get('/api/analytics/stats');
    expect(res.status).toBe(200);
    expect(res.body.totalQuestions).toBe(0);
    expect(res.body.bySubject).toEqual({});
    expect(res.body.byAge).toEqual({});
    expect(res.body.byLanguage).toEqual({});
    expect(res.body.byDate).toEqual({});
  });

  it('returns stored stats when a usage file exists', async () => {
    const stats = { totalQuestions: 42, bySubject: { Math: 15, Science: 27 }, byAge: { little: 30 }, byLanguage: { english: 42 }, byDate: { '2026-06-16': 42 } };
    fsState.data = JSON.stringify(stats);
    const res = await request(app).get('/api/analytics/stats');
    expect(res.status).toBe(200);
    expect(res.body.totalQuestions).toBe(42);
    expect(res.body.bySubject.Math).toBe(15);
  });
});
