// EduBridge Chat Route
// Receives a child's question and returns Claude's tutoring response

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from '../prompts/systemPrompts.js';
import { logUsage } from './analytics.js';

const router = express.Router();

// Initialize the Anthropic client — API key comes from .env, never hardcoded
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/chat — main tutoring endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, subject, ageLevel, language, grade, chapterName, chapterIndex } = req.body;

    // Validate the incoming message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build the child-friendly system prompt for this subject/age/language
    const systemPrompt = getSystemPrompt(subject, ageLevel, language, { grade, chapterName, chapterIndex });

    // Call Claude API (claude-sonnet-4-6, max 1024 tokens per AGENTS.md)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    // Record this question for the analytics dashboard (never blocks the reply)
    logUsage(subject, ageLevel, language);

    // Send Claude's reply back to the frontend
    res.json({ reply: response.content[0].text });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router;
