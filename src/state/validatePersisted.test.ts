import { describe, expect, it } from 'vitest';
import { atTime } from '@/domain/time';
import { FIXTURE_DATE, fullState } from '@/test/fixtures';
import { initialState } from './initialState';
import { validateEvents, validatePersistedState } from './validatePersisted';

const DATE = FIXTURE_DATE;

type Mutation = (state: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

describe('validatePersistedState', () => {
  it('accepts a complete, realistic state', () => {
    expect(validatePersistedState(fullState())).toEqual([]);
    expect(validatePersistedState(initialState(atTime(DATE, '08:00')))).toEqual([]);
  });

  const firstActivity = (state: any) => state.days[DATE].plan.activities[0]; // eslint-disable-line @typescript-eslint/no-explicit-any

  it.each<[string, Mutation]>([
    ['unknown theme', (s) => (s.prefs.theme = 'neon')],
    ['unsupported language', (s) => (s.prefs.locale = 'fr')],
    ['weekday out of range', (s) => (s.settings.workDays = [1, 8])],
    ['schedule ending before it starts', (s) => (s.settings.schedule.workEnd = '08:00')],
    ['malformed time', (s) => (s.settings.schedule.workStart = '9am')],
    ['lunch outside work hours', (s) => (s.settings.schedule.lunch.start = '20:00')],
    ['discomfort above 5', (s) => (s.settings.discomfort.neck = 6)],
    ['missing discomfort area', (s) => delete s.settings.discomfort.eyes],
    ['unknown equipment', (s) => (s.settings.equipment = ['treadmill'])],
    ['notification flag not boolean', (s) => (s.settings.notifications.enabled = 'yes')],
    [
      'override keyed by a non-date',
      (s) => (s.dayOverrides.tomorrow = s.dayOverrides['2026-10-06']),
    ],
    ['override date mismatch', (s) => (s.dayOverrides['2026-10-06'].date = '2026-10-07')],
    ['unknown day status', (s) => (s.days[DATE].status = 'party')],
    ['plan for another date', (s) => (s.days[DATE].plan.date = '2026-10-04')],
    ['activity with unknown status', (s) => (firstActivity(s).status = 'done')],
    ['activity time as text', (s) => (firstActivity(s).scheduledAt = '10:00')],
    ['activity with negative duration', (s) => (firstActivity(s).durationSec = -30)],
    ['activity with unknown content', (s) => (firstActivity(s).content = { kind: 'video' })],
    ['meeting without times', (s) => delete s.days[DATE].plan.meetings[0].end],
    ['summary with text counts', (s) => (s.days['2026-10-02'].summary.completed = 'four')],
    ['unknown mood', (s) => (s.days['2026-10-02'].mood = 'meh')],
    ['evolution phase out of range', (s) => (s.progress.evolutionPhase = 6)],
    ['weekly result with unknown outcome', (s) => (s.progress.weeklyResults[0].result = 'great')],
    ['XP entry with unknown reason', (s) => (s.xpLedger[0].reason = 'cheat')],
    ['XP entry without amount', (s) => delete s.xpLedger[0].amount],
    ['missing install date', (s) => delete s.meta.installedAt],
    ['absurd timestamp', (s) => (s.meta.installedAt = 12)],
    ['xpLedger not a list', (s) => (s.xpLedger = {})],
  ])('rejects %s', (_label, mutate) => {
    const state = fullState();
    mutate(state);
    expect(validatePersistedState(state).length).toBeGreaterThan(0);
  });

  it('rejects prototype-polluting keys', () => {
    const polluted = JSON.parse(
      JSON.stringify(fullState()).replace('"days":{', '"days":{"__proto__":{"polluted":true},'),
    );
    expect(validatePersistedState(polluted)).toContain('days');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('validateEvents', () => {
  const event = { id: 'e1', type: 'exercise_completed', at: atTime(DATE, '10:00'), date: DATE };

  it('accepts well-formed events', () => {
    expect(
      validateEvents([
        event,
        { ...event, id: 'e2', activityId: 'p0', data: { minutes: 10, ok: true } },
      ]),
    ).toEqual([]);
  });

  it.each<[string, unknown]>([
    ['not a list', {}],
    ['unknown type', [{ ...event, type: 'hacked' }]],
    ['bad date', [{ ...event, date: '05/10/2026' }]],
    ['nested data', [{ ...event, data: { nested: { deep: 1 } } }]],
    ['missing id', [{ ...event, id: undefined }]],
  ])('rejects %s', (_label, events) => {
    expect(validateEvents(events).length).toBeGreaterThan(0);
  });
});
