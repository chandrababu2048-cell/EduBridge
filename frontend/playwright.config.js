// Playwright E2E configuration for the EduBridge frontend.
//
// PREREQUISITE: run `npm run build` first — the webServer below serves the
// PRODUCTION build via `vite preview` (there is no dev-server magic here, so
// the tests exercise exactly what ships to users).
//
// Usage:
//   npm run build && npm run test:e2e
//
// In CI (GitHub Actions) the matching Chromium is installed with
// `npx playwright install --with-deps chromium`. In sandboxed local
// environments a pre-installed Chromium may live at /opt/pw-browsers/chromium
// (possibly a different revision than this @playwright/test version expects),
// so we fall back to that executable when it exists and no managed browser
// download is available.

import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';

// Pre-installed sandbox Chromium (symlink to the real binary). Undefined in
// CI / normal dev machines, where Playwright's own managed browser is used.
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = fs.existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined;

export default defineConfig({
  testDir: './e2e',

  // Each test gets 30s; assertions poll up to 10s.
  timeout: 30_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',

  use: {
    baseURL: 'http://localhost:4173',
    // Block service workers: the production build registers a PWA service
    // worker (vite-plugin-pwa) whose fetch handling would bypass page.route()
    // interception and make the offline/error test non-deterministic.
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Serves the production build from dist/ (requires `npm run build` first).
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
