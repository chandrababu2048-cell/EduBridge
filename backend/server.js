// EduBridge Backend Server
// Express server that connects the frontend to the Claude API.
// V2: adds rate limiting, request logging, a richer health check, and usage analytics.

// Load environment variables FIRST — 'dotenv/config' runs immediately on import,
// so ANTHROPIC_API_KEY is set before routes/chat.js creates the Anthropic client
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import chatRouter from './routes/chat.js';
import analyticsRouter from './routes/analytics.js';
import agentsRouter from './routes/agents.js';

const app = express();

// Render/Vercel sit behind a proxy — trust it so rate limiting sees real client IPs
app.set('trust proxy', 1);

// Enable CORS so the frontend can call this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

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
app.listen(PORT, () => console.log(`EduBridge backend running on port ${PORT}`));
