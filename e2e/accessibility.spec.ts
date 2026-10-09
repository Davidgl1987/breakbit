import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { MONDAY_MORNING, monday, onboard, travelTo } from './helpers';

/** WCAG 2.2 A and AA, which includes contrast and the 24 px minimum target size. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const colorScheme of ['light', 'dark'] as const) {
  test(`every screen of a workday passes axe, with 44 px targets (${colorScheme})`, async ({
    page,
  }) => {
    test.slow();
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.clock.install({ time: MONDAY_MORNING });
    const found: string[] = [];
    const scan = async (screen: string) => {
      // Let the screen settle (fonts, entrance transitions) before checking it.
      await page.evaluate(() => document.fonts.ready);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      found.push(
        ...(await smallTargets(page)).map((target) => `${screen}: target < 44px → ${target}`),
      );
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (overflow > 0) found.push(`${screen}: ${overflow}px of horizontal scroll`);
      for (const violation of violations) {
        const targets = violation.nodes.map((node) => node.target.join(' ')).slice(0, 4);
        found.push(`${screen}: ${violation.id} (${violation.impact}) → ${targets.join(' | ')}`);
      }
    };

    await page.goto('/');
    await scan('welcome');
    await page.getByRole('button', { name: 'Comenzar' }).click();
    for (const step of ['schedule', 'discomfort', 'equipment', 'intensity']) {
      await scan(`onboarding/${step}`);
      await page.getByRole('button', { name: 'Siguiente' }).click();
    }
    await scan('onboarding/summary');
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Tu plan de hoy' })).toBeVisible();
    await scan('today (before the day)');

    await page.getByRole('link', { name: 'Empezar jornada' }).click();
    await scan('day start');
    await page.getByRole('button', { name: 'Empezar jornada' }).click();
    await expect(page.getByRole('heading', { name: 'Próxima pausa' })).toBeVisible();
    await scan('today (active)');

    const firstPause = page.locator('li', { hasText: 'Pausa ·' }).first();
    const time = (await firstPause.locator('span').first().textContent())!.trim();
    await travelTo(page, monday(time));
    await page.getByRole('link', { name: 'Vamos' }).first().click();
    await scan('pause decision');
    await page.getByRole('button', { name: 'Vamos' }).click();
    await scan('pause player');
    await page.getByRole('button', { name: 'Hecho' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '¡Pausa hecha!' })).toBeVisible();
    await scan('pause done');
    await page.getByRole('button', { name: 'Volver a lo mío' }).click();

    await page.getByRole('link', { name: 'Tengo un hueco' }).click();
    await scan('gap');
    await page.getByRole('link', { name: /^10\+ minutos/ }).click();
    await scan('gap proposal');
    // Back to the options, then closed: it returns to Today, where it was opened.
    await page.getByRole('link', { name: 'Volver' }).click();
    await page.getByRole('link', { name: 'Cerrar' }).click();
    await page.getByRole('button', { name: 'Ver actividad' }).click();
    await scan('main activity preview and editor');
    await page.getByRole('dialog').getByRole('link', { name: 'Empezar' }).click();
    await scan('main activity');
    await page.getByRole('button', { name: 'Empezar' }).click();
    await scan('main activity (running)');
    await page.getByRole('link', { name: 'Cerrar' }).click();

    await page.getByRole('link', { name: 'Progreso' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Progreso' })).toBeVisible();
    await scan('progress');
    await page.getByRole('link', { name: 'Ajustes' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeVisible();
    await scan('settings');
    await page.getByRole('button', { name: 'Editar Jornada habitual' }).click();
    await scan('settings/schedule');

    await travelTo(page, monday('17:05'));
    await page.goto('/day/end');
    await expect(page.getByRole('heading', { level: 1, name: 'Fin de jornada' })).toBeVisible();
    await scan('day end');

    expect(found, found.join('\n')).toEqual([]);
  });
}

test('the keyboard reaches every control on Today and Settings, with a visible focus ring', async ({
  page,
}) => {
  await page.clock.install({ time: MONDAY_MORNING });
  await onboard(page);
  await page.getByRole('link', { name: 'Empezar jornada' }).click();
  await page.getByRole('button', { name: 'Empezar jornada' }).click();
  await expect(page.getByRole('heading', { name: 'Próxima pausa' })).toBeVisible();

  for (const [path, title] of [
    ['/', 'Tu plan de hoy'],
    ['/settings', 'Ajustes'],
  ] as const) {
    if (path !== '/') await page.getByRole('link', { name: 'Ajustes' }).click();
    // A new screen hands focus to its title, so Tab starts from the top of it.
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeFocused();
    const seen = new Set<string>();
    const unseen: string[] = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body) return undefined;
        const style = getComputedStyle(element);
        const ring =
          (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2) ||
          style.boxShadow !== 'none';
        const box = element.getBoundingClientRect();
        return {
          key: `${element.tagName} ${element.getAttribute('aria-label') ?? element.textContent?.trim().slice(0, 30)}`,
          ring,
          visible: box.width > 0 && box.height > 0,
        };
      });
      if (!focused || seen.has(focused.key)) break;
      seen.add(focused.key);
      if (!focused.ring || !focused.visible) unseen.push(focused.key);
    }
    expect(seen.size, path).toBeGreaterThan(5);
    expect(unseen, `${path}: focus without a visible ring`).toEqual([]);
  }
});

/** Controls smaller than the 44 × 44 px the app aims for (inline text links aside). */
async function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const selector =
      'button, a[href], input:not([type="hidden"]), select, textarea, [role="radio"], [role="switch"], [role="checkbox"], [role="tab"], [tabindex="0"]';
    // A native control inside a bigger clickable area (a label, a field): that's the target.
    const area = (element: HTMLElement): Element => {
      if (element.tagName !== 'INPUT') return element;
      let node = element.parentElement;
      while (node && node !== document.body) {
        if (node.tagName === 'LABEL' || getComputedStyle(node).cursor === 'pointer') return node;
        node = node.parentElement;
      }
      return element;
    };
    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        const style = getComputedStyle(element);
        if (style.visibility === 'hidden' || style.display === 'inline') return false;
        // Not reachable on its own (a hidden file input opened by a row).
        if (element.tabIndex < 0 && !element.matches('[role="radio"]')) return false;
        const target = area(element).getBoundingClientRect();
        // The seven weekdays share one row: at 375 px each is ~41 px wide (still 44 tall).
        const weekday = element.parentElement!.children.length === 7 && target.width >= 40;
        return (target.width < 44 && !weekday) || target.height < 44;
      })
      .map((element) => {
        const box = element.getBoundingClientRect();
        const name = (element.getAttribute('aria-label') ?? element.textContent ?? '').trim();
        return `${element.tagName.toLowerCase()} "${name.slice(0, 30)}" ${Math.round(box.width)}×${Math.round(box.height)}`;
      });
  });
}
