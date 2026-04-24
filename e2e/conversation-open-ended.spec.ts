import { expect, test, type Page } from '@playwright/test';

const SESSION_KEY = 'nova:e2e-session';

async function seedConversationSession(page: Page, worldId = 'w3') {
  await page.addInitScript(
    ({ key, session }) => {
      window.localStorage.setItem(key, JSON.stringify(session));
    },
    {
      key: SESSION_KEY,
      session: {
        uid: 'e2e-parent',
        child: {
          id: 'e2e-child',
          name: 'E2E Kid',
          avatarId: 'owl',
          ageGroup: 'stars',
          currentWorldId: worldId,
          currentUnitId: 'u1',
        },
      },
    },
  );
}

async function openScenario(page: Page, scenarioId: string, worldId = 'w3') {
  await seedConversationSession(page, worldId);
  await page.goto(`/conversation?scenarioId=${scenarioId}`);
  await page.getByRole('button', { name: /Start 🎤|Başla 🎤/ }).click();
  await expect(
    page.getByPlaceholder(/Type or speak English\.\.\.|İngilizce yaz ya da konuş\.\.\./),
  ).toBeVisible();
}

test.describe('Open-ended conversation flows', () => {
  test('personalizes myRoutine follow-up from free-text morning answer', async ({ page }) => {
    await openScenario(page, 'phase3_home_my_routine');

    await page
      .getByPlaceholder(/Type or speak English\.\.\.|İngilizce yaz ya da konuş\.\.\./)
      .fill('Every morning I feed my cat');
    await page.keyboard.press('Enter');

    await expect(
      page.getByText('Feed my cat sounds like a great start', { exact: false }).first(),
    ).toBeVisible();
  });

  test('keeps article-aware job slot in follow-up prompt', async ({ page }) => {
    await openScenario(page, 'phase4_jobs_i_want_to_be', 'w4');

    await page
      .getByPlaceholder(/Type or speak English\.\.\.|İngilizce yaz ya da konuş\.\.\./)
      .fill('I want to be an engineer');
    await page.keyboard.press('Enter');

    await expect(
      page.getByText('What will you DO as an engineer?', { exact: false }).first(),
    ).toBeVisible();
  });
});
