import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { swPrecache } from './build/swPrecache.ts';

const PURE_TESTS = ['src/domain/**/*.test.ts', 'src/content/**/*.test.ts', 'build/**/*.test.ts'];

export default defineConfig({
  plugins: [react(), swPrecache()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
  build: {
    rolldownOptions: {
      output: {
        // Libraries apart from the app: they change less often, so they stay cached.
        codeSplitting: { groups: [{ name: 'vendor', test: /node_modules/ }] },
      },
    },
  },
  // Reachable from other devices on the local network (e.g. a phone) for manual testing.
  // Coverage reports are written inside the project; they shouldn't reload the app.
  server: { host: true, watch: { ignored: ['**/coverage/**'] } },
  preview: { host: true },
  test: {
    globals: true,
    // Date logic is tested against a fixed zone with DST (spring forward 29 Mar, back 25 Oct 2026).
    env: { TZ: 'Europe/Madrid' },
    projects: [
      {
        extends: true,
        test: { name: 'domain', environment: 'node', include: PURE_TESTS },
      },
      {
        extends: true,
        test: {
          name: 'app',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: PURE_TESTS,
          setupFiles: ['./src/test/setup.ts'],
          css: { modules: { classNameStrategy: 'non-scoped' } },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
      thresholds: {
        'src/domain/**/*.ts': { lines: 90, branches: 90, functions: 90, statements: 90 },
      },
    },
  },
});
