import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { atTime } from '@/domain/time';
import { clearEvents, logEvent, readEvents } from '@/services/eventLog';
import { BackupError, exportBackup, importBackup, parseBackup, resetAllData } from './backup';
import { fullState } from '@/test/fixtures';
import { STATE_VERSION, useAppStore } from './store';

const store = () => useAppStore.getState();

describe('backup', () => {
  beforeEach(async () => {
    await clearEvents();
  });

  it('round-trips all data and the event log', async () => {
    store().completeOnboarding({ ...DEFAULT_SETTINGS, intensity: 'soft' });
    store().setCustomSchedule('2026-10-05', { ...DEFAULT_SETTINGS.schedule, workEnd: '15:00' });
    await logEvent('exercise_completed', { at: atTime('2026-10-05', '10:00'), activityId: 'p0' });

    const backup = JSON.parse(JSON.stringify(await exportBackup()));
    expect(backup).toMatchObject({ app: 'breakbit', version: STATE_VERSION });

    await resetAllData();
    expect(store().onboardedAt).toBeUndefined();
    expect(await readEvents()).toEqual([]);

    await importBackup(backup);
    expect(store().settings.intensity).toBe('soft');
    expect(store().dayOverrides['2026-10-05']?.schedule?.workEnd).toBe('15:00');
    expect((await readEvents()).map((event) => event.activityId)).toEqual(['p0']);
  });

  it('migrates backups from older versions', () => {
    const { state } = parseBackup({
      app: 'breakbit',
      version: 1,
      exportedAt: 0,
      state: { prefs: { theme: 'dark', locale: 'es' } },
      events: [],
    });
    expect(state.prefs.theme).toBe('dark');
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
  });

  it.each([
    ['not an object', 'nope'],
    ['another app', { app: 'other', version: 2, state: {}, events: [] }],
    ['no version', { app: 'breakbit', state: {}, events: [] }],
    ['broken state', { app: 'breakbit', version: STATE_VERSION, state: { prefs: {} }, events: [] }],
    [
      'state that is not an object',
      { app: 'breakbit', version: STATE_VERSION, state: 'x', events: [] },
    ],
    [
      'unknown event',
      {
        app: 'breakbit',
        version: 1,
        state: {},
        events: [{ id: 'x', type: 'hacked', at: 1, date: '2026-10-05' }],
      },
    ],
  ])('rejects invalid files: %s', (_label, raw) => {
    expect(() => parseBackup(raw)).toThrow(BackupError);
  });

  it('leaves current data untouched when a file is invalid', async () => {
    store().completeOnboarding({ ...DEFAULT_SETTINGS, intensity: 'active' });
    await logEvent('exercise_completed', { at: atTime('2026-10-05', '10:00') });
    const valid = JSON.parse(JSON.stringify(await exportBackup()));
    valid.state.settings.discomfort.neck = 9;

    await expect(importBackup(valid)).rejects.toBeInstanceOf(BackupError);
    expect(store().settings.intensity).toBe('active');
    expect(await readEvents()).toHaveLength(1);
  });

  it('reports which fields are invalid', () => {
    try {
      parseBackup({
        app: 'breakbit',
        version: STATE_VERSION,
        state: { ...fullState(), settings: { ...fullState().settings, intensity: 'extreme' } },
        events: [],
      });
      expect.unreachable();
    } catch (error) {
      expect((error as BackupError).issues).toEqual(['settings.intensity']);
    }
  });

  it('deletes data and the event log, keeping only appearance and language', async () => {
    store().setTheme('dark');
    store().setLocale('en');
    useAppStore.setState({ ...fullState(), prefs: { theme: 'dark', locale: 'en' } });
    await logEvent('day_completed', { at: atTime('2026-10-05', '17:00') });

    await resetAllData();

    const after = useAppStore.getState();
    expect(after.prefs).toEqual({ theme: 'dark', locale: 'en' });
    expect(after.onboardedAt).toBeUndefined();
    expect(after.settings).toEqual(DEFAULT_SETTINGS);
    expect(after.dayOverrides).toEqual({});
    expect(after.days).toEqual({});
    expect(after.xpLedger).toEqual([]);
    expect(after.progress).toEqual({ evolutionPhase: 1, weeklyResults: [], unlockedRoomItems: [] });
    expect(await readEvents()).toEqual([]);
  });

  it('rejects backups from a newer app version', () => {
    try {
      parseBackup({ app: 'breakbit', version: STATE_VERSION + 1, state: {}, events: [] });
      expect.unreachable();
    } catch (error) {
      expect((error as BackupError).code).toBe('unsupported_version');
    }
  });
});
