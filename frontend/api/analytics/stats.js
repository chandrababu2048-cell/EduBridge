// GET /api/analytics/stats — usage numbers for the teacher dashboard.
// Reads the best-effort /tmp usage file written by api/chat.js.
// On the free serverless setup these numbers are approximate and may reset;
// for exact long-term tracking, add Vercel KV (see RUNBOOK.md).
import fs from 'fs';

const USAGE_FILE = '/tmp/usage.json';
const empty = () => ({ totalQuestions: 0, bySubject: {}, byAge: {}, byLanguage: {}, byDate: {} });

export default function handler(req, res) {
  try {
    if (!fs.existsSync(USAGE_FILE)) {
      return res.status(200).json(empty());
    }
    res.status(200).json(JSON.parse(fs.readFileSync(USAGE_FILE)));
  } catch (err) {
    res.status(500).json({ error: 'Could not load stats' });
  }
}
