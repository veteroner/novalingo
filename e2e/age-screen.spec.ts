import { expect, test } from '@playwright/test';

test('ilk açılış ekranı boş ve tarafsızdır; servisler henüz başlamaz', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (/googleapis\.com|google-analytics\.com|sentry\.io|recaptcha/.test(request.url()))
      externalRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Doğum tarihin nedir?' })).toBeVisible();
  for (const label of ['Gün', 'Ay', 'Yıl'])
    await expect(page.getByRole('textbox', { name: label, exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Devam Et', exact: true })).toBeDisabled();
  await expect(page.getByText('Google ile Giriş Yap')).toHaveCount(0);
  expect(externalRequests).toEqual([]);
});

test('çocuk tarihi sosyal giriş açmaz ve yeniden açılışta korunur', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Gün', exact: true }).fill('1');
  await page.getByRole('textbox', { name: 'Ay', exact: true }).fill('1');
  await page.getByRole('textbox', { name: 'Yıl', exact: true }).fill('2018');
  await page.getByRole('button', { name: 'Devam Et', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Hemen Başla (Kayıtsız)', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Google ile Giriş Yap' })).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Hemen Başla (Kayıtsız)', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Doğum tarihin nedir?' })).toHaveCount(0);
});
