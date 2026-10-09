import { expect, test } from '@playwright/test';

test('the Exercise Lab opens from its URL in the production build', async ({ page }) => {
  // Not linked from the app, and outside onboarding: a fresh visit goes straight in.
  await page.goto('/dev/exercises');
  await expect(page.getByRole('heading', { level: 1, name: 'Exercise Lab' })).toBeVisible();
  await expect(page.getByText(/^0 \/ \d+ revisados$/)).toBeVisible();
});
