import { expect, test } from '@playwright/test';
import { MONDAY_MORNING, monday, onboard, travelTo } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: MONDAY_MORNING });
});

test('a workday: start it, do a pause, use a gap and close the day', async ({ page }) => {
  await onboard(page);

  // Start the day with the proposed plan.
  await page.getByRole('link', { name: 'Empezar jornada' }).click();
  await page.getByRole('button', { name: 'Empezar jornada' }).click();
  await expect(page.getByRole('heading', { name: 'Próxima pausa' })).toBeVisible();

  // Go to the first pause's time: it shows up on Today.
  const firstPause = page.locator('li', { hasText: 'Pausa ·' }).first();
  const time = (await firstPause.locator('span').first().textContent())!.trim();
  await travelTo(page, monday(time));
  await page.getByRole('link', { name: 'Vamos' }).first().click();

  // Decide, do it and see what it earned.
  await page.getByRole('button', { name: 'Vamos' }).click();
  await page.getByRole('button', { name: 'Hecho' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '¡Pausa hecha!' })).toBeVisible();
  await expect(page.getByText('+120 XP')).toBeVisible();
  await page.getByRole('button', { name: 'Volver a lo mío' }).click();
  await expect(page.getByText(/^1\/\d+ pausas$/)).toBeVisible();

  // A gap a little later: an extra pause.
  await travelTo(page, new Date((await page.evaluate(() => Date.now())) + 5 * 60_000));
  await page.getByRole('link', { name: 'Tengo un hueco' }).click();
  await page.getByRole('link', { name: /30 segundos/ }).click();
  await page.getByRole('button', { name: 'Empezar ahora' }).click();
  await page.getByRole('button', { name: 'Hecho' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '¡Pausa hecha!' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver a lo mío' }).click();

  // The end of the day: close it from Today.
  await travelTo(page, monday('17:05'));
  await page.getByRole('link', { name: 'Cerrar jornada' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Fin de jornada' })).toBeVisible();
  await page.getByRole('radio', { name: 'Bien', exact: true }).click();
  await page.getByRole('button', { name: 'Cerrar jornada' }).click();
  await expect(page.getByText('Día cerrado')).toBeVisible();
});

test('the data survives a reload', async ({ page }) => {
  await onboard(page);
  await page.getByRole('link', { name: 'Empezar jornada' }).click();
  await page.getByRole('button', { name: 'Empezar jornada' }).click();
  await expect(page.getByRole('heading', { name: 'Próxima pausa' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Próxima pausa' })).toBeVisible();
});
