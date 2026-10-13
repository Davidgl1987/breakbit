import { expect, type Page } from '@playwright/test';

/** Monday 5 October 2026, before work: the app's clock starts here. */
export const MONDAY_MORNING = new Date('2026-10-05T08:40:00+02:00');

/** That Monday at `time` (Madrid). */
export function monday(time: string): Date {
  return new Date(`2026-10-05T${time}:00+02:00`);
}

/** Moves the page's clock forward to `to`, letting the app's timers run. */
export async function travelTo(page: Page, to: Date): Promise<void> {
  const now = await page.evaluate(() => Date.now());
  if (to.getTime() > now) await page.clock.fastForward(to.getTime() - now);
  // A couple of engine ticks (every 15 s) so reminders and states catch up.
  await page.clock.runFor(31_000);
}

/** Brand introduction and onboarding with the defaults. */
export async function onboard(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await page.getByRole('button', { name: 'Preparar mi plan' }).click();
  for (const heading of ['Tu jornada', 'Tus molestias', 'Tu material', 'A tu ritmo']) {
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page.getByRole('heading', { level: 1, name: 'Un buen comienzo' })).toBeVisible();
  await page.getByRole('button', { name: 'Ir a Hoy' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tu plan de hoy' })).toBeVisible();
}
