import { describe, expect, it } from 'vitest';
import { idbStateStorage } from '@/services/storage';
import { STATE_VERSION, useAppStore } from './store';

const KEY = 'breakbit:state';

describe('app store persistence', () => {
  it('writes preference changes to IndexedDB', async () => {
    useAppStore.getState().setTheme('dark');
    useAppStore.getState().setLocale('en');

    const raw = await idbStateStorage.getItem(KEY);
    expect(JSON.parse(raw as string)).toEqual({
      state: { prefs: { theme: 'dark', locale: 'en' } },
      version: STATE_VERSION,
    });
  });

  it('restores preferences from IndexedDB on rehydration', async () => {
    await idbStateStorage.setItem(
      KEY,
      JSON.stringify({
        state: { prefs: { theme: 'light', locale: 'en' } },
        version: STATE_VERSION,
      }),
    );
    await useAppStore.persist.rehydrate();
    expect(useAppStore.getState().prefs).toEqual({ theme: 'light', locale: 'en' });
  });
});
