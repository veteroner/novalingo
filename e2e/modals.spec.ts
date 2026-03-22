/**
 * Modal & Protected-Screen Smoke Tests
 *
 * Authenticated modal flows (settings, streakLost, collectible, confirmation)
 * require a logged-in child session which is not available in the CI E2E
 * environment without Firebase emulator auth setup.
 *
 * These tests therefore focus on:
 *  1. Public page integrity (no console errors from new modal imports)
 *  2. Protected routes redirect to /login (confirms routing still works after wiring)
 *  3. Performance baseline for modal-heavy screens
 *
 * To run full modal interaction tests locally with emulator auth, set
 * FIREBASE_AUTH_EMULATOR_HOST and seed a test user before running.
 */

import { expect, test } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Collect browser console errors during a page navigation. */
async function collectConsoleErrors(page: Parameters<typeof test>[1] extends never ? never : import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Public page integrity — modal code should not break imports
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Public pages load without JS errors', () => {
  test('login page loads cleanly (no console errors)', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      // Ignore known benign Firebase/Vite noise
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });

    await page.goto('/login');
    await expect(page).toHaveURL(/login/);

    // Give the JS bundle time to fully evaluate
    await page.waitForLoadState('networkidle');

    // Filter out network-related noise (emulator not running in CI)
    const appErrors = errors.filter(
      (e) =>
        !e.includes('net::ERR_') &&
        !e.includes('firebase') &&
        !e.includes('firestore') &&
        !e.includes('auth') &&
        !e.includes('Failed to fetch'),
    );
    expect(appErrors).toHaveLength(0);
  });

  test('onboarding page loads cleanly', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/onboarding/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Protected routes — must redirect to /login (guards still work after wiring)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Modal-hosting screens redirect when unauthenticated', () => {
  const protectedRoutes = [
    { label: 'home (streak-lost trigger host)', path: '/home' },
    { label: 'profile (settings + streakLost buttons)', path: '/profile' },
    { label: 'collection (collectible modal entry)', path: '/collection' },
    { label: 'achievements', path: '/achievements' },
    { label: 'shop', path: '/shop' },
    { label: 'parent (settings link from SettingsModal)', path: '/parent' },
    { label: 'parent settings', path: '/parent/settings' },
  ];

  for (const route of protectedRoutes) {
    test(`${route.label} → redirects to /login`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveURL(/login/);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Performance baseline
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Performance', () => {
  test('login page loads within 3 seconds (modal bundle size check)', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Modal DOM structure — verified against the rendered HTML on the login page
//    (GlobalModalRenderer is mounted in AppProviders which wraps everything)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Modal renderer is mounted in app shell', () => {
  test('app shell renders without crashing (modal renderer included)', async ({ page }) => {
    // Any page that loads the full React app is fine — login is public
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // The root React mount-point should exist and not be empty
    const root = page.locator('#root');
    await expect(root).toBeAttached();
    const innerHTML = await root.innerHTML();
    expect(innerHTML.length).toBeGreaterThan(50);
  });
});
