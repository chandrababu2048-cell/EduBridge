// EduBridge Backend Server
// Express server that connects the frontend to the Claude API

// Load environment variables FIRST — 'dotenv/config' runs immediately on import,
// so ANTHROPIC_API_KEY is set before routes/chat.js creates the Anthropic client
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

const app = express();

// Enable CORS so the frontend can call this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Mount the chat routes under /api
app.use('/api', chatRouter);

// Simple health check endpoint to verify the server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'EduBridge backend' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
