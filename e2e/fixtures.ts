import { test as base, expect } from '@playwright/test';

// Mevcut akış testleri doğrulanmış ebeveyn oturumuyla başlar.
// İlk açılış/yaş doğrulama testleri doğrudan @playwright/test kullanır.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'novalingo:age-screen:v1',
        JSON.stringify({ version: 1, band: 'adult' }),
      );
    });
    await use(page);
  },
});
export { expect };
export type { Page } from '@playwright/test';
