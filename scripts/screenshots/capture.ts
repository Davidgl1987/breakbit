/**
 * Screenshots and a short GIF of a pause for posts and stores, in Spanish and English:
 * `pnpm screenshots` (needs ffmpeg for the GIF and the MP4). Written to docs/lanzamiento/capturas/
 * (not committed: run it again after visual changes).
 *
 * Runs the dev server, where the dev tools can load eight weeks of believable history
 * (app/dev/historyScenario.ts) and move the app's clock; their button is hidden here.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContextOptions, type Page } from '@playwright/test';
import { createServer } from 'vite';

const PORT = 5199;
const BASE = `http://localhost:${PORT}`;
const OUT = fileURLToPath(new URL('../../docs/lanzamiento/capturas/', import.meta.url));

const LOCALES = {
  es: {
    locale: 'es-ES',
    go: 'Vamos',
    start: 'Empezar',
    next: 'Siguiente',
    done: 'Hecho',
    celebrate: '¡Pausa hecha!',
    devTools: 'Abrir herramientas de desarrollo',
  },
  en: {
    locale: 'en-GB',
    go: "Let's go",
    start: 'Start',
    next: 'Next',
    done: 'Done',
    celebrate: 'Break done!',
    devTools: 'Open developer tools',
  },
} as const;
type Lang = keyof typeof LOCALES;

const PHONE: BrowserContextOptions = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'light',
  timezoneId: 'Europe/Madrid',
};
const DESKTOP: BrowserContextOptions = {
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
  timezoneId: 'Europe/Madrid',
};

const server = await createServer({
  server: { port: PORT, strictPort: true, host: 'localhost' },
  logLevel: 'error',
});
await server.listen();
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

try {
  for (const lang of Object.keys(LOCALES) as Lang[]) {
    await phoneShots(browser, lang);
    await desktopShot(browser, lang);
    await pauseGif(browser, lang);
  }
  console.log(`Written to ${OUT}`);
} finally {
  await browser.close();
  await server.close();
}

async function phoneShots(browser: Browser, lang: Lang) {
  const context = await browser.newContext({ ...PHONE, locale: LOCALES[lang].locale });
  const page = await open(context.newPage(), lang);
  await shot(page, `${lang}-1-portada`);

  await loadHistory(page);
  await shot(page, `${lang}-2-hoy`);

  const pause = await nextPause(page);
  await page.goto(`${BASE}/pause/${encodeURIComponent(pause)}`);
  await button(page, lang, 'go');
  await button(page, lang, 'start');
  await page.waitForTimeout(2500);
  await shot(page, `${lang}-3-pausa`);
  await finish(page, lang, 800);
  await page.waitForTimeout(1500);
  await shot(page, `${lang}-4-pausa-hecha`);

  await page.goto(`${BASE}/progress`);
  await shot(page, `${lang}-5-progreso`);

  await loadGoodWeek(page);
  await page.waitForTimeout(2500);
  await shot(page, `${lang}-6-evoluciona`);
  await context.close();
}

async function desktopShot(browser: Browser, lang: Lang) {
  const context = await browser.newContext({ ...DESKTOP, locale: LOCALES[lang].locale });
  const page = await open(context.newPage(), lang);
  await loadHistory(page);
  await shot(page, `${lang}-7-escritorio`);
  await context.close();
}

/** From the decision to the celebration, as a looping GIF and an MP4 (for LinkedIn). */
async function pauseGif(browser: Browser, lang: Lang) {
  const videoDir = `${OUT}.video`;
  const setup = await browser.newContext({ ...PHONE, locale: LOCALES[lang].locale });
  const setupPage = await open(setup.newPage(), lang);
  await loadHistory(setupPage);
  const pause = await nextPause(setupPage);
  const storage = await setup.storageState({ indexedDB: true });
  await setup.close();

  // A fresh context with the same data, recording from its first frame.
  const context = await browser.newContext({
    ...PHONE,
    deviceScaleFactor: 2,
    locale: LOCALES[lang].locale,
    storageState: storage,
    recordVideo: { dir: videoDir, size: { width: 390, height: 844 } },
  });
  const started = Date.now();
  const page = await open(context.newPage(), lang, `/pause/${encodeURIComponent(pause)}`);
  const from = (Date.now() - started) / 1000;
  await page.waitForTimeout(1500);
  await button(page, lang, 'go');
  await page.waitForTimeout(800);
  await button(page, lang, 'start');
  await page.waitForTimeout(3500);
  await finish(page, lang, 2500);
  await page.waitForTimeout(2500);
  const length = (Date.now() - started) / 1000 - from;
  await context.close();

  const video = `${videoDir}/${readdirSync(videoDir)[0]}`;
  const gif = `${OUT}${lang}-pausa.gif`;
  // Two passes: a palette made from the clip itself, then the GIF with it.
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-ss',
    from.toFixed(2),
    '-t',
    length.toFixed(2),
    '-i',
    video,
    '-vf',
    'fps=15,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
    gif,
  ]);
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-ss',
    from.toFixed(2),
    '-t',
    length.toFixed(2),
    '-i',
    video,
    '-vf',
    'scale=780:-2:flags=lanczos',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '20',
    '-movflags',
    '+faststart',
    `${OUT}${lang}-pausa.mp4`,
  ]);
  rmSync(videoDir, { recursive: true, force: true });
}

async function button(page: Page, lang: Lang, key: 'go' | 'start' | 'next' | 'done') {
  await page.getByRole('button', { name: LOCALES[lang][key], exact: true }).click();
}

/** Moves on to the pause's last move, lets it run `ms` and finishes it. */
async function finish(page: Page, lang: Lang, ms: number) {
  const done = page.getByRole('button', { name: LOCALES[lang].done, exact: true });
  for (let step = 0; step < 6 && !(await done.isVisible()); step++) {
    await button(page, lang, 'next');
    // Taps right after the move changed are ignored (STEP_TAP_GUARD_MS).
    await page.waitForTimeout(1000);
  }
  await button(page, lang, 'start');
  await page.waitForTimeout(ms);
  await done.click();
  await page.getByRole('heading', { level: 1, name: LOCALES[lang].celebrate }).waitFor();
}

/** Opens `path` and hides the dev tools' button. */
async function open(pagePromise: Promise<Page>, lang: Lang, path = '/'): Promise<Page> {
  const page = await pagePromise;
  // Runs in the page, where `document` exists.
  await page.addInitScript(`addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = 'button[aria-label="${LOCALES[lang].devTools}"] { display: none !important; }';
    document.head.append(style);
  });`);
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState('networkidle');
  return page;
}

/** Eight weeks of history; the app's clock on Wednesday 14 October 2026 at 12:30. */
async function loadHistory(page: Page) {
  await page.evaluate(`(async () => {
    const { useAppStore } = await import('/src/state/store.ts');
    const { historyScenarioState, HISTORY_NOW } = await import('/src/app/dev/historyScenario.ts');
    const { clock } = await import('/src/services/clock.ts');
    const state = useAppStore.getState();
    state.replaceData(historyScenarioState(state));
    clock.travelTo(HISTORY_NOW);
  })()`);
  // Lets the store reach IndexedDB before reloading.
  await page.waitForTimeout(800);
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
}

/** A good week judged on the Monday after: the avatar evolves (app/dev/weekScenarios.ts). */
async function loadGoodWeek(page: Page) {
  const week = await page.evaluate(`(async () => {
    const { useAppStore } = await import('/src/state/store.ts');
    const scenarios = await import('/src/app/dev/weekScenarios.ts');
    const { clock } = await import('/src/services/clock.ts');
    const state = useAppStore.getState();
    state.replaceData(scenarios.weekScenarioState('evolve', state));
    clock.travelTo(scenarios.SCENARIO_NOW);
    useAppStore.getState().evaluateWeeks(scenarios.SCENARIO_NOW);
    return scenarios.SCENARIO_WEEK;
  })()`);
  await page.waitForTimeout(800);
  await page.goto(`${BASE}/week/${encodeURIComponent(String(week))}`);
  await page.waitForLoadState('networkidle');
}

/** Moves the app's clock to today's next pause and returns its id. */
async function nextPause(page: Page): Promise<string> {
  const id = await page.evaluate(`(async () => {
    const { useAppStore } = await import('/src/state/store.ts');
    const { clock } = await import('/src/services/clock.ts');
    const { toDateKey } = await import('/src/domain/time.ts');
    const now = clock.now();
    const next = useAppStore.getState().days[toDateKey(now)].plan.activities
      .filter((item) => item.kind === 'micro' && item.currentScheduledAt > now)
      .sort((a, b) => a.currentScheduledAt - b.currentScheduledAt)[0];
    clock.travelTo(next.currentScheduledAt + 30000);
    return next.id;
  })()`);
  await page.waitForTimeout(2500);
  return String(id);
}

async function shot(page: Page, name: string) {
  await page.evaluate('document.fonts.ready.then(() => window.scrollTo(0, 0))');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}${name}.png` });
}
