// Safety Monitor Agent — SHIM.
// The canonical classifier logic (hardened anti-jailbreak prompt, JSON parsing,
// fail-open behaviour) lives in frontend/api/_lib/safetyMonitor.js and is
// re-exported through shared/. Do not re-implement it here.
//
// We construct the checker with THIS package's Anthropic client so that the
// backend's own SDK install is used (and so tests that mock
// '@anthropic-ai/sdk' from backend/ keep working — frontend/ has a separate
// node_modules copy that backend mocks would not intercept).
import Anthropic from '@anthropic-ai/sdk';
import { createSafetyChecker } from '../../shared/safetyMonitor.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const checkMessageSafety = createSafetyChecker(client);
