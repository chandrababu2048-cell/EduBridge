// EduBridge Backend Server
// Express server that connects the frontend to the Claude API.
// V2: adds rate limiting, request logging, a richer health check, and usage analytics.
// V3: adds Helmet security headers and locked-down CORS.

// Load environment variables FIRST — 'dotenv/config' runs immediately on import,
// so ANTHROPIC_API_KEY is set before routes/chat.js creates the Anthropic client
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import chatRouter from './routes/chat.js';
import analyticsRouter from './routes/analytics.js';
import agentsRouter from './routes/agents.js';
import teacherRouter from './routes/teacher.js';
import studentRouter from './routes/student.js';
import publicRouter from './routes/public.js';

const app = express();

// Render/Vercel sit behind a proxy — trust it so rate limiting sees real client IPs
app.set('trust proxy', 1);

// Security headers — sets X-Content-Type-Options, X-Frame-Options, HSTS, etc.
app.use(helmet());

// CORS — allow only the configured origin (or localhost in dev).
// In production set ALLOWED_ORIGIN=https://your-app.vercel.app in the Render env vars.
// In local dev, leave ALLOWED_ORIGIN unset and the server falls back to localhost:5173.
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
if (!process.env.ALLOWED_ORIGIN) {
  console.warn('[CORS] ALLOWED_ORIGIN not set — defaulting to localhost. Set this in production.');
}
app.use(cors({ origin: allowedOrigin, credentials: true }));

// Parse incoming JSON request bodies. Default limit is 100kb — far too small
// for photo-a-problem uploads (up to ~4.2MB of base64 image data, matching
// the shared validation cap which itself stays under Vercel's 4.5MB body
// limit so dev and production accept the same payloads).
app.use(express.json({ limit: '5mb' }));

// Request logging with timestamps (Apache "combined" format includes date + IP)
app.use(morgan('combined'));

// Rate limiting — max 20 requests per IP per minute, with a kid-friendly message.
// Protects the free Anthropic key from abuse / runaway costs.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many questions! Please wait a minute 😊' }
});
app.use('/api', limiter);

// Chat + analytics routes, both under /api
app.use('/api', chatRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/agents', agentsRouter);

// Teacher, student, and public routes
app.use('/api/teacher', teacherRouter);
app.use('/api/student', studentRouter);
app.use('/api/public', publicRouter);

// Health check endpoint — used by the runbook to confirm the service is alive
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.warn(`[server] EduBridge backend running on port ${PORT}`));
