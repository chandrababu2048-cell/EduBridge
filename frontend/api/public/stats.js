// GET /api/public/stats — marketing numbers shown on the landing page.
// Returns hardcoded fallback values; swap for a real database query when
// you add persistent storage (e.g. Vercel KV or Supabase).
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json({
    questionsAnswered: 12480,
    languages: 7,
    subjects: 7,
  });
}
