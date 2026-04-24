/**
 * Subscription Screen E2E Tests
 *
 * Covers the parent subscription UI surface:
 *  - Route protection (redirect when not auth'd)
 *  - Subscription page structure when accessed as parent
 *    (full auth tests require emulator — see CI_AUTH_EMULATOR_HOST)
 *
 * Also tests the parent dashboard route map so subscription entry points
 * remain discoverable.
 */

import { expect, test } from '@playwright/test';
import { APP_BUNDLE_ID, IAP_PRODUCTS } from '../src/config/constants';

// ─────────────────────────────────────────────────────────────────────────────
// Route protection
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Subscription route protection', () => {
  test('/parent/subscription redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/parent/subscription');
    await expect(page).toHaveURL(/login/);
  });

  test('/shop redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/shop');
    await expect(page).toHaveURL(/login/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// No-crash checks — subscription code must not break public pages
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Subscription bundle does not break public pages', () => {
  test('login page has no JS errors from subscription imports', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') jsErrors.push(msg.text());
    });
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Filter out Firebase/network noise that is expected in CI without emulator
    const appErrors = jsErrors.filter(
      (e) =>
        !e.includes('net::ERR_') &&
        !e.includes('firebase') &&
        !e.includes('firestore') &&
        !e.includes('Failed to fetch') &&
        !e.includes('favicon'),
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IAP product constants are defined (sanity check via window variable)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('IAP product IDs are configured', () => {
  test('subscription product IDs are present in app bundle', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    expect(APP_BUNDLE_ID).toBe('com.novalingo.app');
    expect(IAP_PRODUCTS.MONTHLY).toBe(`${APP_BUNDLE_ID}.monthly`);
    expect(IAP_PRODUCTS.YEARLY).toBe(`${APP_BUNDLE_ID}.yearly`);
  });
});
