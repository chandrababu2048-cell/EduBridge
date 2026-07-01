// EduBridge E2E smoke suite — drives a real Chromium against the PRODUCTION
// build (`npm run build` then `vite preview`, see playwright.config.js).
//
// The preview build has no VITE_SUPABASE_URL, so the app runs in guest mode
// (AuthContext handles a null supabase client) — none of these tests depend
// on authentication. VITE_API_URL is empty in .env.production, so API calls
// go to the same origin (/api/...) and can be intercepted with page.route().

import { test, expect } from '@playwright/test';

/**
 * Walk the /app welcome screen: pick a subject and a grade, then enter chat.
 * Uses accessible roles so the test survives styling changes.
 */
async function openChat(page, { subject = 'Science', grade = '7' } = {}) {
  await page.goto('/app');

  // Subject pills render as buttons named "<emoji> <name>" (substring match).
  await page.getByRole('button', { name: subject }).click();

  // Grade buttons are labelled exactly "1".."12".
  await page.getByRole('button', { name: grade, exact: true }).click();

  await page.getByRole('button', { name: 'Start Learning', exact: true }).click();

  // Chat screen is ready once the input is visible.
  await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();
}

test('landing page renders hero headline and CTA', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Every Indian Child'
  );

  // "Start Learning Free" appears in both the nav and the hero — assert the
  // first visible one.
  await expect(
    page.getByRole('link', { name: 'Start Learning Free' }).first()
  ).toBeVisible();
});

test('"Start Learning Free" navigates to the app welcome screen', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Start Learning Free' }).first().click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Start Learning', exact: true })
  ).toBeVisible();
});

test('selecting subject and grade opens the chat screen', async ({ page }) => {
  await openChat(page, { subject: 'Science', grade: '7' });

  // Top bar shows "<emoji> <subject>" for the chosen subject.
  await expect(page.getByText('🔬 Science')).toBeVisible();

  // The tutor greeting bubble is already present.
  await expect(page.getByText("Hi! I'm EduBridge")).toBeVisible();
});

test('shows a friendly error bubble when the API is unreachable', async ({
  page,
}) => {
  // Abort ALL API calls: the safety-check failure falls through as "safe"
  // (ChatBox catches it and defaults to { status: 'safe' }), then /api/chat
  // fails → the catch block posts the error bubble. navigator.onLine is true
  // in headless Chromium, so we get the "Oops" variant, not the offline one.
  await page.route('**/api/**', (route) => route.abort());

  await openChat(page);

  const input = page.getByPlaceholder('Ask me anything…');
  // Not one of the example chips, so the text is unique on the page.
  await input.fill('What is photosynthesis?');
  await input.press('Enter');

  // The user's message renders immediately…
  await expect(page.getByText('What is photosynthesis?')).toBeVisible();
  // …followed by the error bubble once the fetch fails.
  await expect(page.getByText('Oops! Something went wrong')).toBeVisible();
});

test('PWA manifest is served with the EduBridge name', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');

  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest.name).toContain('EduBridge');
});

test('photo-a-problem: upload shows a preview, remove clears it', async ({ page }) => {
  await openChat(page);

  // The camera button opens the hidden file input.
  await expect(
    page.getByRole('button', { name: 'Send a photo of your problem' })
  ).toBeVisible();

  // A real 1x1 red-pixel PNG so FileReader produces a valid data URL.
  const onePixelPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  await page.getByTestId('photo-input').setInputFiles({
    name: 'problem.png',
    mimeType: 'image/png',
    buffer: onePixelPng,
  });

  // Preview thumbnail appears with a remove button.
  await expect(page.getByAltText('photo of the problem, ready to send')).toBeVisible();
  await page.getByRole('button', { name: 'Remove photo' }).click();
  await expect(
    page.getByAltText('photo of the problem, ready to send')
  ).not.toBeVisible();
});
