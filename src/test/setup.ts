import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { initialState } from '@/state/initialState';
import { useAppStore } from '@/state/store';
import { installMatchMedia, resetMatchMedia } from './matchMedia';

installMatchMedia();

beforeEach(() => {
  // A fresh install in Spanish for every test.
  useAppStore.setState(initialState(Date.now(), { theme: 'system', locale: 'es' }));
});

afterEach(() => {
  cleanup();
  resetMatchMedia();
});
