// EduBridge Practice Route (doubt-to-mastery)
// After the tutor answers, the frontend calls this endpoint to generate
// 2 quick multiple-choice questions testing the same concept, so the child
// can prove they learned it.
//
// Validation and generation come from the shared canonical modules
// (shared/ -> frontend/api/_lib/). This Express server runs from a full repo
// checkout (local dev / VM only) — production uses frontend/api/practice.js.
// Do not re-implement the prompt, parsing, or allowlists in this file.
//
// FAIL-SOFT: model misbehaviour (bad JSON, wrong shape) or a Claude API error
// returns 200 { questions: [] } — the frontend silently skips the practice
// card. Only invalid CLIENT input (missing/oversized concept) gets a 400.
// Rate limiting comes from the global /api limiter in server.js.

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { validatePracticeRequest } from '../../shared/validation.js';
import { generatePracticeQuestions } from '../../shared/practice.js';

const router = express.Router();

// Initialize the Anthropic client — API key comes from .env, never hardcoded
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/practice — generate practice questions for a just-explained concept
router.post('/practice', async (req, res) => {
  try {
    // Validate + sanitize the request body (shared canonical logic)
    const result = validatePracticeRequest(req.body);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    // Fail-soft by construction: generatePracticeQuestions never throws —
    // any model/API failure comes back as an empty array.
    const questions = await generatePracticeQuestions(anthropic, result.sanitized);
    res.json({ questions });
  } catch (error) {
    // Belt-and-braces: even an unexpected error must not surface as a 500 —
    // the chat reply already succeeded; practice just silently skips.
    console.error('Practice endpoint error:', error);
    res.status(200).json({ questions: [] });
  }
});

export default router;
