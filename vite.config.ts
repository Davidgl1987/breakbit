import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const PURE_TESTS = ['src/domain/**/*.test.ts', 'src/content/**/*.test.ts'];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
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
