/**
 * Renders scripts/og-image/og.html to public/og-image.png (1200×630), the image shown when a
 * Breakbit link is shared. Run after changing the page: `pnpm og-image`.
 */
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const page = new URL('./og.html', import.meta.url).href;
const output = fileURLToPath(new URL('../../public/og-image.png', import.meta.url));

const browser = await chromium.launch();
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await tab.goto(page);
  // Runs in the page, where `document` exists.
  await tab.evaluate('document.fonts.ready.then(() => true)');
  await tab.screenshot({ path: output });
  console.log(`Written ${output}`);
} finally {
  await browser.close();
}
