// GET /api/public/stats — impact numbers shown on the landing page.
//
// questionsAnswered comes from the real usage_events row count in Supabase
// (a HEAD count query — no rows are ever fetched; see _lib/usageStore.js).
// `languages` and `subjects` are static facts about the product itself.
//
// The CDN cache header means Vercel serves this from edge cache for an hour,
// so Supabase sees at most ~1 count query per hour regardless of traffic.
//
// Resilience: if analytics is not configured, the query fails, or the table
// is empty (count 0), we return the long-standing fallback numbers so the
// landing page never shows zeros.
import { getQuestionsAnsweredCount } from '../_lib/usageStore.js';

const FALLBACK_STATS = {
  questionsAnswered: 12480,
  languages: 7,
  subjects: 7,
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const count = await getQuestionsAnsweredCount(); // never throws; null on failure
  if (!count) {
    return res.status(200).json(FALLBACK_STATS);
  }
  res.status(200).json({
    questionsAnswered: count,
    languages: FALLBACK_STATS.languages,
    subjects: FALLBACK_STATS.subjects,
  });
}
