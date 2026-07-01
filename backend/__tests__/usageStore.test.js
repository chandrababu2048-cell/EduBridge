// Tests for the persistent, zero-PII usage analytics store and the public
// stats endpoint. Real Supabase is never contacted: vitest.config.js aliases
// '@supabase/supabase-js' to __tests__/helpers/supabaseStub.js (a plain
// vi.mock cannot intercept the frontend/node_modules copy the canonical
// usageStore resolves), and the "not configured" paths are exercised by
// clearing env vars. Tests drive the stub via globalThis.__supabaseCreateClient.
//
// The invariants under test are the reliability guarantees:
//   * analytics NEVER throws into the chat path (no-op without env vars,
//     swallowed errors on insert failure)
//   * /api/public/stats ALWAYS returns the fallback shape when Supabase is
//     unreachable, misconfigured, or empty — the landing page never shows zeros.
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const supabaseMock = {
  createClient: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
};

import {
  logUsageEvent,
  getQuestionsAnsweredCount,
  _resetUsageStoreForTests,
} from '../../shared/usageStore.js';
import statsHandler from '../../frontend/api/public/stats.js';

const ENV_KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const savedEnv = {};

/** Point the store at the mocked Supabase client. */
function configureEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
}

/** Minimal Express-style res double for the serverless stats handler. */
function makeRes() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  vi.clearAllMocks();
  _resetUsageStoreForTests();
  // Route the aliased '@supabase/supabase-js' stub to this test's mocks.
  // Default mock client: insert succeeds, count query returns 0
  globalThis.__supabaseCreateClient = supabaseMock.createClient;
  supabaseMock.createClient.mockReturnValue({
    from: () => ({
      insert: supabaseMock.insert,
      select: supabaseMock.select,
    }),
  });
  supabaseMock.insert.mockResolvedValue({ error: null });
  supabaseMock.select.mockResolvedValue({ count: 0, error: null });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  delete globalThis.__supabaseCreateClient;
  vi.restoreAllMocks();
});

describe('logUsageEvent — not configured (no env vars)', () => {
  it('does not throw and resolves without creating a client', async () => {
    await expect(
      logUsageEvent({ subject: 'Math', ageLevel: 'little', language: 'english' })
    ).resolves.toBeUndefined();
    expect(supabaseMock.createClient).not.toHaveBeenCalled();
    expect(supabaseMock.insert).not.toHaveBeenCalled();
  });

  it('warns only once across repeated calls', async () => {
    await logUsageEvent({ subject: 'Math' });
    await logUsageEvent({ subject: 'Science' });
    await logUsageEvent({ subject: 'English' });
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('does not throw when called with no arguments at all', async () => {
    await expect(logUsageEvent()).resolves.toBeUndefined();
  });
});

describe('logUsageEvent — configured', () => {
  beforeEach(configureEnv);

  it('inserts a zero-PII row with snake_case columns', async () => {
    await logUsageEvent({ subject: 'Math', ageLevel: 'older', language: 'telugu', grade: 7 });
    expect(supabaseMock.insert).toHaveBeenCalledWith({
      subject: 'Math',
      age_level: 'older',
      language: 'telugu',
      grade: 7,
    });
  });

  it('stores null for missing fields and non-integer grades', async () => {
    await logUsageEvent({ subject: 'Math', grade: 'seven' });
    expect(supabaseMock.insert).toHaveBeenCalledWith({
      subject: 'Math',
      age_level: null,
      language: null,
      grade: null,
    });
  });

  it('never rejects when the insert reports a Supabase error', async () => {
    supabaseMock.insert.mockResolvedValue({ error: { message: 'permission denied' } });
    await expect(logUsageEvent({ subject: 'Math' })).resolves.toBeUndefined();
  });

  it('never rejects when the insert throws (network down)', async () => {
    supabaseMock.insert.mockRejectedValue(new Error('fetch failed'));
    await expect(logUsageEvent({ subject: 'Math' })).resolves.toBeUndefined();
  });

  it('reuses one client across calls (no per-request client churn)', async () => {
    await logUsageEvent({ subject: 'Math' });
    await logUsageEvent({ subject: 'Science' });
    expect(supabaseMock.createClient).toHaveBeenCalledTimes(1);
  });
});

describe('getQuestionsAnsweredCount', () => {
  it('returns null when analytics is not configured', async () => {
    expect(await getQuestionsAnsweredCount()).toBeNull();
  });

  it('returns the real count via a HEAD count query (never fetches rows)', async () => {
    configureEnv();
    supabaseMock.select.mockResolvedValue({ count: 4213, error: null });
    expect(await getQuestionsAnsweredCount()).toBe(4213);
    expect(supabaseMock.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
  });

  it('returns null instead of throwing when the query errors', async () => {
    configureEnv();
    supabaseMock.select.mockResolvedValue({ count: null, error: { message: 'timeout' } });
    expect(await getQuestionsAnsweredCount()).toBeNull();
  });

  it('returns null instead of throwing when the query rejects', async () => {
    configureEnv();
    supabaseMock.select.mockRejectedValue(new Error('network unreachable'));
    expect(await getQuestionsAnsweredCount()).toBeNull();
  });
});

describe('GET /api/public/stats (serverless handler)', () => {
  const FALLBACK = { questionsAnswered: 12480, languages: 7, subjects: 7 };

  it('returns the fallback shape when Supabase is not configured', async () => {
    const res = makeRes();
    await statsHandler({}, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(FALLBACK);
  });

  it('returns the fallback shape when Supabase is unreachable', async () => {
    configureEnv();
    supabaseMock.select.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = makeRes();
    await statsHandler({}, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(FALLBACK);
  });

  it('returns the fallback (never zeros) when the table is empty', async () => {
    configureEnv();
    supabaseMock.select.mockResolvedValue({ count: 0, error: null });
    const res = makeRes();
    await statsHandler({}, res);
    expect(res.body).toEqual(FALLBACK);
  });

  it('returns the real count plus static product facts when available', async () => {
    configureEnv();
    supabaseMock.select.mockResolvedValue({ count: 9001, error: null });
    const res = makeRes();
    await statsHandler({}, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ questionsAnswered: 9001, languages: 7, subjects: 7 });
  });

  it('always sets the CDN cache header', async () => {
    const res = makeRes();
    await statsHandler({}, res);
    expect(res.headers['Cache-Control']).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
  });
});
