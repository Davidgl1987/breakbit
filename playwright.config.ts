import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the production build (`vite preview`): the real service worker
 * and offline shell, in a phone and a desktop window. Time is driven with `page.clock`.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'mobile',
      // A touch phone at the narrowest width the layout is designed for.
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 375, height: 812 },
        locale: 'es-ES',
        timezoneId: 'Europe/Madrid',
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        locale: 'es-ES',
        timezoneId: 'Europe/Madrid',
      },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
