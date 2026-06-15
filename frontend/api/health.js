// GET /api/health — quick "is the service alive?" check used by the runbook.
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
}
