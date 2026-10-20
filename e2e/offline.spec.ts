import { expect, test, type Page } from '@playwright/test';

/** Every image on the page has finished loading and decoded to something. */
async function expectAllImagesLoaded(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll(
          (images) =>
            (images as HTMLImageElement[]).filter((image) => !image.complete || !image.naturalWidth)
              .length,
        ),
    )
    .toBe(0);
}

test('opens without a connection once it has been visited', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible();
  // The service worker has kept the shell and now controls the page.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }),
      );
    }
  });

  await context.setOffline(true);
  const failed: string[] = [];
  page.on('requestfailed', (request) => failed.push(request.url()));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible();
  // Brand art included, though the first visit showed it before the worker was there.
  await expect(page.locator('img[src^="/brand/"]').first()).toBeVisible();
  await expectAllImagesLoaded(page);
  // The next screen's pixel icons were never shown online: they come from the kept shell.
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await expect(page.locator('img[src^="/icons/"]').first()).toBeVisible();
  await expectAllImagesLoaded(page);
  expect(failed).toEqual([]);
  await context.setOffline(false);
});

test('is installable: manifest and icons', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifestUrl = new URL(href!, page.url());
  const manifest = await (await request.get(manifestUrl.href)).json();
  expect(manifest).toMatchObject({ name: 'Breakbit', display: 'standalone' });
  // Relative to the manifest, so the app works at the root or under a sub-path.
  expect(new URL(manifest.start_url, manifestUrl).href).toBe(new URL('/', page.url()).href);
  for (const icon of manifest.icons as { src: string }[]) {
    expect((await request.get(new URL(icon.src, manifestUrl).href)).ok()).toBe(true);
  }
  expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable')).toBe(
    true,
  );
});
