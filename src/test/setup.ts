import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { useAppStore } from '@/state/store';
import { installMatchMedia, resetMatchMedia } from './matchMedia';

installMatchMedia();

beforeEach(() => {
  useAppStore.setState({ prefs: { theme: 'system', locale: 'es' } });
});

afterEach(() => {
  cleanup();
  resetMatchMedia();
});
