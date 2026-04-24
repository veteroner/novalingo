/**
 * Critical-Path Route Protection E2E Tests
 *
 * Verifies that all critical routes (lesson, conversation, SRS, parent, shop)
 * redirect to /login when not authenticated. This ensures route guards
 * are wired and no route accidentally becomes public.
 *
 * These tests run in CI without Firebase emulator auth.
 */

import { expect, test } from '@playwright/test';

async function gotoRoute(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Route protection
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Critical routes redirect when unauthenticated', () => {
  const criticalRoutes = [
    { label: 'onboarding', path: '/onboarding' },
    { label: 'lesson result', path: '/lesson-result' },
    { label: 'conversation', path: '/conversation' },
    { label: 'conversation result', path: '/conversation-result' },
    { label: 'SRS review', path: '/review' },
    { label: 'parent dashboard', path: '/parent' },
    { label: 'parent settings', path: '/parent/settings' },
    { label: 'subscription screen', path: '/parent/subscription' },
    { label: 'achievements', path: '/achievements' },
    { label: 'collection', path: '/collection' },
    { label: 'shop', path: '/shop' },
    { label: 'profile', path: '/profile' },
    { label: 'world map', path: '/worlds' },
    { label: 'home', path: '/home' },
  ];

  for (const route of criticalRoutes) {
    test(`${route.label} (${route.path}) → redirects to /login`, async ({ page }) => {
      await gotoRoute(page, route.path);
      await expect(page).toHaveURL(/login/);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Public routes stay public
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Public routes accessible without auth', () => {
  test('/login is accessible', async ({ page }) => {
    await gotoRoute(page, '/login');
    await expect(page).toHaveURL(/login/);
    const root = page.locator('#root');
    await expect(root).toBeAttached();
  });

  test('/legal/privacy is accessible without auth', async ({ page }) => {
    await gotoRoute(page, '/legal/privacy');
    // Must NOT redirect to login — legal must be public
    await expect(page).not.toHaveURL(/login/);
    await expect(page.getByRole('heading', { name: 'Gizlilik Politikası' })).toBeVisible();
  });

  test('/legal/terms is accessible without auth', async ({ page }) => {
    await gotoRoute(page, '/legal/terms');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.getByRole('heading', { name: 'Kullanım Koşulları' })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Login screen integrity
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login screen UI', () => {
  test('shows login choices and consent checkbox', async ({ page }) => {
    await gotoRoute(page, '/login');

    await expect(page.getByRole('button', { name: /Google ile Giriş Yap/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Apple ile Giriş Yap/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Hemen Başla \(Kayıtsız\)/i })).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();
  });

  test('login actions are disabled before consent', async ({ page }) => {
    await gotoRoute(page, '/login');

    await expect(page.getByRole('button', { name: /Google ile Giriş Yap/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Apple ile Giriş Yap/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Hemen Başla \(Kayıtsız\)/i })).toBeDisabled();
  });

  test('consent checkbox enables login actions', async ({ page }) => {
    await gotoRoute(page, '/login');

    await page.getByRole('checkbox').check();

    await expect(page.getByRole('button', { name: /Google ile Giriş Yap/i })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Apple ile Giriş Yap/i })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Hemen Başla \(Kayıtsız\)/i })).toBeEnabled();
  });

  test('legal links are present on login screen', async ({ page }) => {
    await gotoRoute(page, '/login');

    await expect(page.getByRole('link', { name: 'Kullanım Koşulları' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Gizlilik Politikası' })).toBeVisible();
  });
});
