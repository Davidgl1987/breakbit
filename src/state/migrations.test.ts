import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { initialState } from './initialState';
import { migrateState, STATE_VERSION } from './migrations';

const NOW = 1_790_000_000_000;

describe('migrateState', () => {
  it('upgrades the Fase 1 shape (only preferences) keeping them', () => {
    const migrated = migrateState({ prefs: { theme: 'dark', locale: 'en' } }, 1, NOW);
    expect(migrated.prefs).toEqual({ theme: 'dark', locale: 'en' });
    expect(migrated.settings).toEqual(DEFAULT_SETTINGS);
    expect(migrated).toMatchObject({
      days: {},
      dayOverrides: {},
      xpLedger: [],
      progress: { evolutionPhase: 1, weeklyResults: [], unlockedRoomItems: [] },
      meta: { installedAt: NOW },
    });
    expect(migrated.onboardedAt).toBeUndefined();
  });

  it('fills missing preferences with defaults', () => {
    expect(migrateState({}, 1, NOW).prefs.theme).toBe('system');
  });

  it('turns the pause sound on for data saved before it existed, keeping a choice made', () => {
    const v2 = (notifications: object) => ({
      ...initialState(NOW),
      settings: { ...DEFAULT_SETTINGS, notifications },
    });
    const before = { enabled: true, dayStart: true, microbreaks: true, dayEnd: false };
    expect(migrateState(v2(before), 2, NOW).settings.notifications).toEqual({
      ...before,
      sound: true,
    });
    expect(migrateState(v2({ ...before, sound: false }), 2, NOW).settings.notifications.sound).toBe(
      false,
    );
  });

  it('leaves a broken state for validation to reject', () => {
    expect(migrateState({ prefs: {} }, 2, NOW)).toEqual({ prefs: {} });
  });

  it('leaves current data untouched', () => {
    const state = { prefs: { theme: 'light' } };
    expect(migrateState(state, STATE_VERSION, NOW)).toBe(state);
  });

  it('refuses data from a newer version', () => {
    expect(() => migrateState({}, STATE_VERSION + 1, NOW)).toThrow();
  });
});
