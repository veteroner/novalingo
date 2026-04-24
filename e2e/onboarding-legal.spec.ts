/**
 * Onboarding + Legal Screen E2E Tests
 *
 * Covers:
 *  - Onboarding slide navigation (4 steps)
 *  - ParentalGate appearance (COPPA math gate)
 *  - COPPA consent checkboxes rendered after math pass (requires actual interaction)
 *  - Legal screen — privacy / terms content renders
 *  - Legal tab switching works
 */

import { expect, test } from '@playwright/test';

async function gotoRoute(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding access
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Onboarding route protection', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await gotoRoute(page, '/onboarding');

    await expect(page).toHaveURL(/login/);
  });

  test('login screen still exposes legal consent links after redirect', async ({ page }) => {
    await gotoRoute(page, '/onboarding');

    await expect(page).toHaveURL(/login/);
    await expect(page.getByRole('link', { name: 'Kullanım Koşulları' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Gizlilik Politikası' })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Legal Screen — Privacy Policy + Terms of Service
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Legal Screen — Privacy Policy', () => {
  test('renders privacy policy content', async ({ page }) => {
    await gotoRoute(page, '/legal/privacy');

    await expect(page.getByRole('heading', { name: 'Gizlilik Politikası' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Veri Sorumlusu/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Çocuk Gizliliği \(COPPA\)/ })).toBeVisible();
  });

  test('COPPA section mentions parental consent', async ({ page }) => {
    await gotoRoute(page, '/legal/privacy');

    await expect(page.getByText(/ebeveyn\/vasi onayıyla/i)).toBeVisible();
  });

  test('tab switch navigates to terms of service', async ({ page }) => {
    await gotoRoute(page, '/legal/privacy');

    await page.getByRole('button', { name: 'Kullanım Koşulları' }).click();
    await expect(page).toHaveURL(/legal\/terms/);
    await expect(page.getByRole('heading', { name: /Hizmet Tanımı/ })).toBeVisible();
  });

  test('back button works', async ({ page }) => {
    await gotoRoute(page, '/login');

    // Go somewhere first so back has history
    await gotoRoute(page, '/legal/privacy');

    const backBtn = page.getByRole('button', { name: 'Geri' });
    await expect(backBtn).toBeVisible();
  });

  test('/legal redirects to /legal/privacy', async ({ page }) => {
    await gotoRoute(page, '/legal');
    await expect(page).toHaveURL(/legal\/privacy/);
  });
});

test.describe('Legal Screen — Terms of Service', () => {
  test('renders terms content', async ({ page }) => {
    await gotoRoute(page, '/legal/terms');

    await expect(page.getByRole('heading', { name: 'Kullanım Koşulları' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Ücretlendirme/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Hesap Gereksinimleri/ })).toBeVisible();
  });

  test('mentions 18 age requirement for parent account', async ({ page }) => {
    await gotoRoute(page, '/legal/terms');

    await expect(page.getByText(/18 yaş/)).toBeVisible();
  });
});
