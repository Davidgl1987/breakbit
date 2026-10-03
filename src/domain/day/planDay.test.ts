import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSettings } from '@/test/builders';
import { microbreakViolations } from '@/test/planInvariants';
import { generateDayPlan } from '../planner/generateDayPlan';
import { atTime, fromMinutes, minutesOfDay, toMinutes } from '../time';
import type { DayPlan, DayRecord, ScheduledActivity } from '../types';
import { changeMainActivity, choiceFits, planDay, recentExerciseIds } from './planDay';

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
