// CANONICAL usage-analytics store — persistent, privacy-first counters.
//
// This module is the single write/read path for the `usage_events` table
// (see backend/supabase/migrations/003_usage_events.sql). It records ONLY
// coarse product dimensions — subject, age band, language, grade — with
// zero PII: no user id, no IP, no message content, ever.
//
// It lives in frontend/api/_lib/ so Vercel's serverless bundler is
// guaranteed to include it (see shared/index.js for the full rationale);
// the Express backend imports it via shared/usageStore.js.
//
// SECURITY: uses the server-only env vars SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY. NEVER the VITE_* vars — anything prefixed
// VITE_ is compiled into the browser bundle, and the service-role key
// bypasses RLS. These vars exist only in Vercel/Render server settings.
//
// RELIABILITY: analytics must NEVER break or slow the tutoring path.
// Every export swallows its own errors; callers fire-and-forget.
import { createClient } from '@supabase/supabase-js';

let client = null;        // lazily created, reused across warm invocations
let warnedDisabled = false; // console.warn once per instance, not per request

/**
 * Returns a service-role Supabase client, or null when analytics is
 * disabled (env vars not configured). Never throws.
 */
function getClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    if (!warnedDisabled) {
      warnedDisabled = true;
      console.warn(
        'Analytics disabled: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. ' +
        'Chat works normally; usage events are simply not recorded.'
      );
    }
    return null;
  }
  try {
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.warn('Analytics disabled: could not create Supabase client:', err?.message);
    return null;
  }
  return client;
}

/**
 * Records one anonymous usage event. Fire-and-forget: call WITHOUT await
 * from request handlers (a trailing .catch is built in — the returned
 * promise never rejects). No-ops silently when analytics is not configured.
 *
 * @param {{ subject?: string, ageLevel?: string, language?: string, grade?: number }} event
 * @returns {Promise<void>}
 */
export function logUsageEvent({ subject, ageLevel, language, grade } = {}) {
  const supabase = getClient();
  if (!supabase) return Promise.resolve();
  return supabase
    .from('usage_events')
    .insert({
      subject: subject ?? null,
      age_level: ageLevel ?? null,
      language: language ?? null,
      grade: Number.isInteger(grade) ? grade : null,
    })
    .then(({ error }) => {
      if (error) console.warn('Analytics insert failed:', error.message);
    })
    .catch((err) => {
      console.warn('Analytics insert failed:', err?.message);
    });
}

/**
 * Total number of questions ever answered (row count of usage_events).
 * Uses a HEAD count query — never fetches rows. Returns null when
 * analytics is not configured or the query fails; callers must fall
 * back to their static numbers. Never throws.
 *
 * @returns {Promise<number|null>}
 */
export async function getQuestionsAnsweredCount() {
  const supabase = getClient();
  if (!supabase) return null;
  try {
    const { count, error } = await supabase
      .from('usage_events')
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.warn('Analytics count failed:', error.message);
      return null;
    }
    return typeof count === 'number' ? count : null;
  } catch (err) {
    console.warn('Analytics count failed:', err?.message);
    return null;
  }
}

/** Test-only: reset module state so env-var changes take effect. */
export function _resetUsageStoreForTests() {
  client = null;
  warnedDisabled = false;
}
