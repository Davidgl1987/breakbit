import { expect, test, type Page } from '@playwright/test';
import { MONDAY_MORNING, onboard } from './helpers';

/** Records the kind of every screen transition (`<html data-transition>`). */
async function recordTransitions(page: Page) {
  await page.evaluate(() => {
    const kinds: string[] = [];
    (window as unknown as { kinds: string[] }).kinds = kinds;
    new MutationObserver(() => {
      const kind = document.documentElement.dataset.transition;
      if (kind) kinds.push(kind);
    }).observe(document.documentElement, { attributeFilter: ['data-transition'] });
  });
  return () => page.evaluate(() => (window as unknown as { kinds: string[] }).kinds);
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: MONDAY_MORNING });
  await onboard(page);
  await page.getByRole('link', { name: 'Empezar jornada' }).click();
  await page.getByRole('button', { name: 'Empezar jornada' }).click();
  await expect(page.getByRole('heading', { name: 'Próxima pausa' })).toBeVisible();
});

test('tabs slide, "Tengo un hueco" opens from its button and screens rise and drop', async ({
  page,
}) => {
  const kinds = await recordTransitions(page);
  const settled = () => expect(page.locator('html[data-transition]')).toHaveCount(0);

  await page.getByRole('link', { name: 'Progreso' }).click();
  await settled();
  await page.getByRole('link', { name: 'Tengo un hueco' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tengo un hueco' })).toBeVisible();
  await settled();
  await page.getByRole('link', { name: 'Cerrar' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Progreso' })).toBeVisible();
  await settled();
  await page.getByRole('link', { name: 'Hoy', exact: true }).click();
  await settled();
  await page.getByRole('link', { name: 'Ver actividad' }).click();
  await settled();
  await page.getByRole('link', { name: 'Cerrar' }).click();
  await settled();

  expect(await kinds()).toEqual([
    'slide-forward',
    'gap-open',
    'gap-close',
    'slide-back',
    'push',
    'pop',
  ]);
});

test('a sheet slides up and back down', async ({ page }) => {
  await page.getByRole('button', { name: 'Hoy no trabajo' }).click();
  const sheet = page.getByRole('dialog', { name: '¿Hoy no trabajas?' });
  await expect(sheet).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(sheet).toHaveCount(0);
  // An inert copy plays the way out and goes.
  await expect(page.locator('[aria-hidden="true"][inert]')).toHaveCount(0);
});

test('with reduced motion, screens just change', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const kinds = await recordTransitions(page);
  await page.getByRole('link', { name: 'Progreso' }).click();
  await page.getByRole('link', { name: 'Tengo un hueco' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tengo un hueco' })).toBeVisible();
  expect(await kinds()).toEqual([]);
});
