import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSettings } from '@/test/builders';
import { microbreakViolations } from '@/test/planInvariants';
import { generateDayPlan } from '../planner/generateDayPlan';
import { atTime, fromMinutes, minutesOfDay, toMinutes } from '../time';
import type { DayPlan, DayRecord, ScheduledActivity } from '../types';
import { changeMainActivity, choiceFits, planDay, recentExerciseIds, replanDay } from './planDay';

const DATE = '2026-10-05';
const settings = makeSettings();
const base = { date: DATE, schedule: settings.schedule, settings, catalog: CATALOG } as const;
const micros = (plan: DayPlan) => plan.activities.filter((item) => item.kind === 'micro');
const at = (time: `${number}:${number}`) => atTime(DATE, time);

describe('planDay', () => {
  it('plans the whole day before work starts, like the planner', () => {
    expect(planDay({ ...base, now: at('08:00') })).toEqual(generateDayPlan(base));
  });

  it('plans only what is left when the day starts late', () => {
    const plan = planDay({ ...base, now: at('13:02') });
    expect(plan.activities.length).toBeGreaterThan(0);
    for (const item of plan.activities) {
      expect(minutesOfDay(item.scheduledAt)).toBeGreaterThanOrEqual(toMinutes('13:05'));
    }
  });

  it('keeps what already happened and re-plans the rest around a new meeting', () => {
    const morning = planDay({ ...base, now: at('08:00') });
    const [first] = micros(morning);
    const done: ScheduledActivity = {
      ...first!,
      status: 'completed',
      startedAt: first!.currentScheduledAt,
      completedAt: first!.currentScheduledAt + 60_000,
    };
    const previous = {
      ...morning,
      activities: morning.activities.map((item) => (item.id === done.id ? done : item)),
    };
    const now = done.completedAt!;
    const meetings = [{ id: 'm1', start: '12:00', end: '13:00', canMove: false } as const];

    const plan = planDay({ ...base, meetings, now, previous });

    expect(plan.activities).toContainEqual(done);
    const ids = plan.activities.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(plan.activities.filter((item) => item.kind === 'main')).toHaveLength(1);
    const later = micros(plan).filter((item) => item.id !== done.id);
    for (const item of later) {
      const start = minutesOfDay(item.currentScheduledAt);
      expect(start >= toMinutes('13:00') || start + 3 <= toMinutes('12:00')).toBe(true);
      // New pauses keep their distance from the one just done.
      expect(item.currentScheduledAt - now).toBeGreaterThanOrEqual(35 * 60_000);
    }
    expect(
      microbreakViolations(plan, CATALOG, { from: toMinutes('09:00'), equipment: [] }),
    ).toEqual([]);
  });

  it('keeps a main activity that is under way instead of proposing another', () => {
    const morning = planDay({ ...base, now: at('08:00') });
    const main = morning.activities.find((item) => item.kind === 'main')!;
    const started = { ...main, startedAt: main.currentScheduledAt };
    const previous = {
      ...morning,
      activities: morning.activities.map((item) => (item.id === main.id ? started : item)),
    };
    const plan = planDay({ ...base, now: main.currentScheduledAt + 60_000, previous });
    expect(plan.activities.filter((item) => item.kind === 'main')).toEqual([started]);
  });

  it('honours the main activity the user picked', () => {
    const plan = planDay({
      ...base,
      now: at('08:00'),
      mainActivity: { activityId: 'walk_outside', start: '16:00', durationMin: 20 },
    });
    const main = plan.activities.find((item) => item.kind === 'main')!;
    expect(main.content).toEqual({ kind: 'main', activityId: 'walk_outside' });
    expect(minutesOfDay(main.currentScheduledAt)).toBe(toMinutes('16:00'));
  });
});

describe('recentExerciseIds', () => {
  it('collects the exercises of the two previous days', () => {
    const plan = (date: `${number}-${number}-${number}`) => generateDayPlan({ ...base, date });
    const record = (date: `${number}-${number}-${number}`): DayRecord => ({
      date,
      status: 'closed',
      plan: plan(date),
      returnBonus: false,
      recoveryUsed: false,
    });
    const days = {
      '2026-10-02': record('2026-10-02'),
      '2026-10-03': record('2026-10-03'),
      '2026-10-04': record('2026-10-04'),
    };
    const ids = recentExerciseIds(days, DATE, CATALOG);
    expect(ids.length).toBeGreaterThan(0);
    const older = recentExerciseIds({ '2026-10-02': days['2026-10-02'] }, DATE, CATALOG);
    expect(older).toEqual([]);
  });
});

describe('changeMainActivity', () => {
  const context = { catalog: CATALOG, discomfort: settings.discomfort, equipment: [] };

  it('moves only the main activity and the pauses that clash with it', () => {
    const plan = planDay({ ...base, now: at('08:00') });
    const pauses = micros(plan);
    const clashing = pauses[1]!;
    const start = minutesOfDay(clashing.currentScheduledAt);
    const choice = { activityId: 'walk_indoors', start: fromMinutes(start), durationMin: 10 };

    const changed = changeMainActivity(plan, choice, at('08:00'), context);

    const main = changed.activities.find((item) => item.kind === 'main')!;
    expect(main.content).toEqual({ kind: 'main', activityId: 'walk_indoors' });
    expect(minutesOfDay(main.currentScheduledAt)).toBe(start);
    const moved = changed.activities.find((item) => item.id === clashing.id)!;
    expect(moved.currentScheduledAt).toBeGreaterThan(main.currentScheduledAt);
    // Pauses before it stay where they were, with the same content.
    expect(changed.activities.find((item) => item.id === pauses[0]!.id)).toEqual(pauses[0]);
  });

  it('keeps a main activity that is under way', () => {
    const plan = planDay({ ...base, now: at('08:00') });
    const started: DayPlan = {
      ...plan,
      activities: plan.activities.map((item) =>
        item.kind === 'main' ? { ...item, startedAt: item.currentScheduledAt } : item,
      ),
    };
    const choice = { activityId: 'walk_indoors', start: '16:00', durationMin: 10 } as const;
    expect(changeMainActivity(started, choice, at('12:00'), context)).toBe(started);
  });

  it('knows whether a choice fits in the hours', () => {
    const choice = { activityId: 'walk_outside', start: '16:50', durationMin: 20 } as const;
    expect(choiceFits(choice, settings.schedule)).toBe(false);
    expect(choiceFits({ ...choice, start: '16:40' }, settings.schedule)).toBe(true);
  });
});

describe('replanDay', () => {
  const morning = planDay({
    ...base,
    now: at('08:00'),
    mainActivity: { activityId: 'walk_outside', start: '13:00', durationMin: 20 },
  });
  const [first] = micros(morning);
  const done: ScheduledActivity = {
    ...first!,
    status: 'completed',
    startedAt: first!.currentScheduledAt,
    completedAt: first!.currentScheduledAt + 60_000,
  };
  const day = {
    ...morning,
    activities: morning.activities.map((item) => (item.id === done.id ? done : item)),
  };
  const now = done.completedAt! + 60_000;

  it('re-plans what is left with the new settings, keeping what happened', () => {
    const active = makeSettings({ intensity: 'active' });
    const result = replanDay(day, { settings: active, catalog: CATALOG, now });
    expect(result.activities).toContainEqual(done);
    expect(result.schedule).toEqual(day.schedule);
    // A livelier pace means more pauses in what's left of the day.
    expect(micros(result).length).toBeGreaterThan(micros(day).length);
    for (const item of micros(result)) {
      if (item.id !== done.id) expect(item.currentScheduledAt).toBeGreaterThan(now);
    }
    expect(
      microbreakViolations(result, CATALOG, { from: minutesOfDay(now), equipment: [] }).filter(
        // The pause already done keeps its place, before `from`.
        (issue) => !issue.includes(done.id),
      ),
    ).toEqual([]);
  });

  it('only touches pending pauses still to come', () => {
    // At 12:00: one pause done, one under way, one due and waiting, one postponed.
    const noon = at('12:00');
    const pauses = micros(morning);
    const states: Record<number, Partial<ScheduledActivity>> = {
      0: { status: 'completed', startedAt: at('09:45'), completedAt: at('09:46') },
      1: { startedAt: noon - 60_000 },
      2: { status: 'notification_sent', currentScheduledAt: noon - 5 * 60_000 },
      3: { status: 'postponed', postponeCount: 1, postponeMinutes: 10 },
    };
    const busy = {
      ...morning,
      activities: morning.activities.map((item) => {
        const index = pauses.indexOf(item);
        return index in states ? { ...item, ...states[index] } : item;
      }),
    };
    const keptIds = Object.keys(states).map((index) => pauses[Number(index)]!.id);
    const untouched = busy.activities.filter((item) => keptIds.includes(item.id));
    expect(untouched).toHaveLength(4);
    const result = replanDay(busy, {
      settings: makeSettings({
        intensity: 'active',
        discomfort: { ...settings.discomfort, neck: 5 },
      }),
      catalog: CATALOG,
      now: noon,
    });
    for (const item of untouched) expect(result.activities).toContainEqual(item);
    // Everything else that changed is still to come.
    for (const item of result.activities) {
      if (untouched.some((kept) => kept.id === item.id)) continue;
      expect(item.status).toBe('pending');
      expect(item.startedAt).toBeUndefined();
      expect(item.currentScheduledAt).toBeGreaterThan(noon);
    }
  });

  it('keeps a main activity under way, whatever the equipment', () => {
    const started = {
      ...day,
      activities: day.activities.map((item) =>
        item.kind === 'main' ? { ...item, startedAt: now, runningSince: now } : item,
      ),
    };
    const main = started.activities.find((item) => item.kind === 'main')!;
    const result = replanDay(started, {
      settings: makeSettings({ equipment: [] }),
      catalog: CATALOG,
      now: now + 60_000,
    });
    expect(result.activities).toContainEqual(main);
  });

  it('keeps the main activity while its equipment is still there', () => {
    const result = replanDay(day, { settings, catalog: CATALOG, now });
    expect(result.activities.find((item) => item.kind === 'main')?.content).toEqual({
      kind: 'main',
      activityId: 'walk_outside',
    });
  });

  it('proposes another main activity when its equipment is gone', () => {
    const withBell = makeSettings({ equipment: ['kettlebell'] });
    const kettlebell = planDay({
      ...base,
      settings: withBell,
      now: at('08:00'),
      mainActivity: { activityId: 'kettlebell_block', start: '13:00', durationMin: 10 },
    });
    const result = replanDay(kettlebell, {
      settings: makeSettings({ equipment: [] }),
      catalog: CATALOG,
      now: at('09:00'),
    });
    // Another one, still today, that needs nothing the user no longer has.
    const main = result.activities.find((item) => item.kind === 'main');
    expect(main).toBeDefined();
    expect(main?.content).not.toEqual({ kind: 'main', activityId: 'kettlebell_block' });
    const activityId = main?.content.kind === 'main' ? main.content.activityId : '';
    const replacement = CATALOG.mainActivities.find((item) => item.id === activityId)!;
    expect(replacement.equipment).toEqual([]);
  });
});
