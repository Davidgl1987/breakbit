import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { resolveDaySchedule } from '@/domain/calendar/schedule';
import type { DateKey } from '@/domain/types';
import { makeSchedule } from '@/test/builders';
import { clearEvents, readEvents } from '@/services/eventLog';
import { idbStateStorage } from '@/services/storage';
import { initialState } from './initialState';
import { STATE_VERSION, useAppStore } from './store';

const KEY = 'breakbit:state';
const store = () => useAppStore.getState();
const saved = async () => JSON.parse((await idbStateStorage.getItem(KEY)) as string);

describe('app store', () => {
  beforeEach(async () => {
    await clearEvents();
  });

  it('persists the whole data model, without actions', async () => {
    store().setTheme('dark');
    const { state, version } = await saved();
    expect(version).toBe(STATE_VERSION);
    expect(Object.keys(state).sort()).toEqual(
      ['dayOverrides', 'days', 'meta', 'prefs', 'progress', 'settings', 'xpLedger'].sort(),
    );
    expect(state.prefs.theme).toBe('dark');
  });

  it('restores saved data on rehydration', async () => {
    const data = { ...initialState(1), prefs: { theme: 'light', locale: 'en' } };
    await idbStateStorage.setItem(KEY, JSON.stringify({ state: data, version: STATE_VERSION }));
    await useAppStore.persist.rehydrate();
    expect(store().prefs).toEqual({ theme: 'light', locale: 'en' });
    expect(store().meta.installedAt).toBe(1);
  });

  it('migrates data saved by an older version when rehydrating', async () => {
    await idbStateStorage.setItem(
      KEY,
      JSON.stringify({ state: { prefs: { theme: 'dark', locale: 'en' } }, version: 1 }),
    );
    await useAppStore.persist.rehydrate();
    expect(store().prefs).toEqual({ theme: 'dark', locale: 'en' });
    expect(store().settings).toEqual(DEFAULT_SETTINGS);
    expect(typeof store().setTheme).toBe('function');
  });

  describe('settings', () => {
    it('completes onboarding with the chosen settings', () => {
      const settings = { ...DEFAULT_SETTINGS, intensity: 'active' as const };
      store().completeOnboarding(settings);
      expect(store().settings).toEqual(settings);
      expect(store().onboardedAt).toBeTypeOf('number');
    });

    it('updates part of the settings', () => {
      store().updateSettings({ equipment: ['mat'] });
      expect(store().settings.equipment).toEqual(['mat']);
      expect(store().settings.intensity).toBe(DEFAULT_SETTINGS.intensity);
    });

    it('refuses an invalid schedule', () => {
      expect(() =>
        store().updateSettings({
          schedule: makeSchedule({ workStart: '18:00', workEnd: '09:00' }),
        }),
      ).toThrow(/end_before_start/);
      expect(store().settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('calendar', () => {
    const MONDAY = '2026-10-05';
    const TUESDAY = '2026-10-06';
    const WEDNESDAY = '2026-10-07';
    const scheduleOn = (date: DateKey) =>
      resolveDaySchedule(date, store().settings, store().dayOverrides);

    it('marks a day off and logs it', async () => {
      store().markDayOff(MONDAY);
      expect(scheduleOn(MONDAY)).toBeNull();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const events = await readEvents();
      expect(events.map((event) => event.type)).toEqual(['day_off_marked']);
      expect(events[0]?.data).toEqual({ date: MONDAY });
    });

    it('sets one-off hours, repeats them and clears them', () => {
      const custom = makeSchedule({
        workStart: '08:00',
        workEnd: '15:00',
        lunch: undefined,
        breaks: [],
      });
      store().setCustomSchedule(MONDAY, custom);
      expect(scheduleOn(MONDAY)).toEqual(custom);
      store().repeatSchedule(TUESDAY, custom);
      expect(scheduleOn(TUESDAY)).toEqual(custom);
      store().clearOverride(MONDAY);
      expect(scheduleOn(MONDAY)).toEqual(DEFAULT_SETTINGS.schedule);
    });

    it('skips days until the chosen next workday', () => {
      store().skipUntil(MONDAY, WEDNESDAY);
      expect(scheduleOn(MONDAY)).toBeNull();
      expect(scheduleOn(TUESDAY)).toBeNull();
      expect(scheduleOn(WEDNESDAY)).toEqual(DEFAULT_SETTINGS.schedule);
    });
  });

  describe('data', () => {
    it('resets everything but appearance and language', () => {
      store().setLocale('en');
      store().completeOnboarding(DEFAULT_SETTINGS);
      store().markDayOff('2026-10-05');
      store().resetData();
      expect(store().onboardedAt).toBeUndefined();
      expect(store().dayOverrides).toEqual({});
      expect(store().prefs.locale).toBe('en');
    });
  });
});
