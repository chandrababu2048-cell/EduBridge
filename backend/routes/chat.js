// EduBridge Chat Route
// Receives a child's question and returns Claude's tutoring response.
//
// Validation and the system prompt come from the shared canonical modules
// (shared/ -> frontend/api/_lib/). This Express server runs from a full repo
// checkout (local dev / VM), so importing across directories is safe here.
// Do not re-implement allowlists or sanitization in this file.

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from '../prompts/systemPrompts.js';
import { validateChatRequest } from '../../shared/validation.js';
import { logUsageEvent } from '../../shared/usageStore.js';
import { logUsage } from './analytics.js';

const router = express.Router();

// Initialize the Anthropic client — API key comes from .env, never hardcoded
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/chat — main tutoring endpoint
router.post('/chat', async (req, res) => {
  try {
    // Validate + sanitize the request body (shared canonical logic)
    const result = validateChatRequest(req.body);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    const { message, subject, ageLevel, language, grade, chapterName, chapterIndex, history, image } = result.sanitized;

    // Build the child-friendly system prompt for this subject/age/language.
    // hasImage adds the photo-a-problem instruction (read the photo first).
    const systemPrompt = getSystemPrompt(subject, ageLevel, language, {
      grade,
      chapterName,
      chapterIndex,
      hasImage: Boolean(image),
    });

    // Photo-a-problem: when a validated image is attached, the final user turn
    // becomes a content-block array (image first, then the question) so Claude
    // vision can read the problem off the photo. History stays plain text —
    // images are never echoed back into history (cost + validation strips them).
    const userContent = image
      ? [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
          { type: 'text', text: message },
        ]
      : message;

    // Call Claude API (claude-sonnet-4-6, max 1024 tokens per AGENTS.md).
    // Conversation memory: the sanitized history is guaranteed to be a valid
    // alternating user/assistant list ending with 'assistant' (or empty), so
    // appending the new user message always produces a valid messages array.
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...history.map(({ role, text }) => ({ role, content: text })),
        { role: 'user', content: userContent },
      ]
    });

    // Record this question for analytics (never blocks the reply):
    // durable zero-PII row in Supabase (fire-and-forget, not awaited) +
    // local file counters for the dashboard endpoint.
    logUsageEvent({ subject, ageLevel, language, grade });
    logUsage(subject, ageLevel, language);

    // Send Claude's reply back to the frontend
    const reply = response.content?.[0]?.text;
    if (!reply) {
      console.error('Claude returned no content');
      return res.status(500).json({ error: 'Failed to get response' });
    }
    res.json({ reply });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router;
