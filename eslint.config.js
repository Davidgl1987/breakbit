import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * domain/ (and the content it is fed) is pure TypeScript: no React, no state library,
 * no side-effect layers.
 */
const domainBoundary = {
  files: ['src/domain/**/*.{ts,tsx}', 'src/content/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              'react',
              'react/*',
              'react-dom',
              'react-dom/*',
              'react-router',
              'react-router/*',
            ],
            message: 'domain/ must not depend on React.',
          },
          {
            group: ['zustand', 'zustand/*', 'idb-keyval'],
            message: 'domain/ must not depend on state or storage libraries.',
          },
          {
            group: [
              '@/app/*',
              '@/features/*',
              '@/state/*',
              '@/services/*',
              '@/ui/*',
              '**/app/**',
              '**/features/**',
              '**/state/**',
              '**/services/**',
              '**/ui/**',
            ],
            message: 'domain/ and content/ may only import from domain/ and content/.',
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'node_modules',
      'public',
      'docs',
      'test-results',
      'playwright-report',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ['src/**/*.tsx'],
    ...reactRefresh.configs.vite,
  },
  {
    files: ['scripts/**/*.ts', 'vite.config.ts', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  domainBoundary,
);
