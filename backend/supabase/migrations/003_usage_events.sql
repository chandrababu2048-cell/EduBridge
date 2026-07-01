-- EduBridge — Usage Analytics Migration 003
--
-- Persistent, privacy-first usage analytics for the landing page stats and
-- NGO impact reporting. Replaces the ephemeral /tmp/usage.json counter that
-- was wiped on every Vercel cold start.
--
-- ZERO PII BY DESIGN:
--   * NO user id, NO auth reference, NO IP address, NO session id.
--   * NO message content — we never store what a child asked or was told.
--   * Only coarse product dimensions (subject / age band / language / grade)
--     plus a server-side timestamp. Rows cannot be linked to a person.

CREATE TABLE IF NOT EXISTS public.usage_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  subject    text,   -- e.g. 'Math' | 'Science' | 'English'
  age_level  text,   -- 'little' (6-10) | 'older' (11-14)
  language   text,   -- e.g. 'english' | 'telugu'
  grade      int     -- NCERT class number, when the child picked one
);

-- Index for time-bucketed aggregation (per-day/per-month impact charts)
CREATE INDEX IF NOT EXISTS usage_events_created_at_idx
  ON public.usage_events (created_at);

-- ── Row Level Security: locked down completely ──────────────────────────────
-- RLS is enabled and NO policies are created. With RLS on and zero policies,
-- the anon and authenticated roles can neither read nor write this table.
-- Only the serverless functions insert/aggregate, using the SERVICE ROLE key
-- (which bypasses RLS and must never be shipped to the browser).
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Belt-and-braces: revoke table privileges from client-facing roles too,
-- so even a future accidental "allow all" policy grant is not enough.
REVOKE ALL ON public.usage_events FROM anon, authenticated;

-- ── Aggregated stats helper ──────────────────────────────────────────────────
-- SECURITY DEFINER function returning only an aggregate count — safe to call
-- with the service role from /api/public/stats. Not granted to anon: the
-- public endpoint caches at the CDN, so clients never query Supabase directly.
CREATE OR REPLACE FUNCTION public.public_stats()
RETURNS TABLE (questions_answered bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) AS questions_answered FROM public.usage_events;
$$;

REVOKE ALL ON FUNCTION public.public_stats() FROM PUBLIC, anon, authenticated;
