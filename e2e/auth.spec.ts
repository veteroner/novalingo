import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('shows login screen by default for unauthenticated user', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);
  });

  test('redirects to login when accessing protected route', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL(/login/);
  });

  test('onboarding screen is accessible', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/onboarding/);
  });
});

test.describe('Navigation', () => {
  test('404 redirects to home', async ({ page }) => {
    await page.goto('/nonexistent-page');
    // Should redirect to /home (which then redirects to /login if not auth'd)
    await expect(page).toHaveURL(/login|home/);
  });
});

test.describe('Performance', () => {
  test('login page loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });
});
