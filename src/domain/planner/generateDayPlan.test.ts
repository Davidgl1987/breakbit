import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import {
  discomfortArb,
  equipmentArb,
  intensityArb,
  meetingsArb,
  scheduleArb,
} from '@/test/arbitraries';
import { makeSchedule, makeSettings } from '@/test/builders';
import { exerciseIdsOf, microbreakViolations } from '@/test/planInvariants';
import { addDays, atTime, minutesOfDay, toMinutes } from '../time';
import type { DayPlan, Exercise, ScheduledActivity, UserSettings } from '../types';
import { generateDayPlan, type PlanInput } from './generateDayPlan';
import { buildTimeline, overlaps } from './timeline';

const DATE = '2026-10-05';
const settings = makeSettings();
const micros = (plan: DayPlan) => plan.activities.filter((item) => item.kind === 'micro');
const mainOf = (plan: DayPlan) => plan.activities.find((item) => item.kind === 'main');
const minute = (item: ScheduledActivity) => minutesOfDay(item.scheduledAt);
const plan = (overrides: Partial<PlanInput> = {}) =>
  generateDayPlan({
    date: DATE,
    schedule: settings.schedule,
    settings,
    catalog: CATALOG,
    ...overrides,
  });

describe('generateDayPlan', () => {
  it.each([
    ['soft', 4],
    ['normal', 6],
    ['active', 8],
  ] as const)('plans %s intensity on an 8 h day without lunch: %i pauses', (intensity, count) => {
    const result = plan({
      schedule: makeSchedule({ lunch: undefined, breaks: [] }),
      settings: { ...settings, intensity },
    });
    expect(result.targetMicroCount).toBe(count);
    expect(micros(result)).toHaveLength(count);
  });

  it('counts effective hours without lunch (7 h, normal → 5)', () => {
    expect(micros(plan())).toHaveLength(5);
  });

  it('includes one main activity, in the break when there is one', () => {
    const main = mainOf(plan());
    expect(main).toBeDefined();
    expect(main?.slot).toBe('break');
    expect(minute(main!)).toBe(toMinutes('11:00'));
  });

  it('honours the main activity chosen by the user and keeps pauses away from it', () => {
    const result = plan({
      schedule: makeSchedule({ lunch: undefined, breaks: [] }),
      mainActivity: { activityId: 'walk_indoors', start: '12:00', durationMin: 10 },
    });
    const main = mainOf(result)!;
    expect(main.content).toEqual({ kind: 'main', activityId: 'walk_indoors' });
    expect(minute(main)).toBe(toMinutes('12:00'));
    for (const item of micros(result)) {
      const start = minute(item);
      expect(start + 3 <= toMinutes('11:40') || start >= toMinutes('12:45')).toBe(true);
    }
  });

  it('uses a free break for a dynamic routine', () => {
    const result = plan({
      schedule: makeSchedule({
        breaks: [
          { start: '10:30', durationMin: 15 },
          { start: '16:00', durationMin: 15 },
        ],
      }),
      mainActivity: { activityId: 'walk_outside', start: '10:30', durationMin: 15 },
    });
    const inBreak = micros(result).filter((item) => item.slot === 'break');
    expect(inBreak).toHaveLength(1);
    expect(minute(inBreak[0]!)).toBe(toMinutes('16:00'));
    expect(inBreak[0]!.content.kind).toBe('routine');
    expect(inBreak[0]!.pauseType).not.toBe('micro');
  });

  it('never schedules pauses during lunch or busy meetings', () => {
    const result = plan({ meetings: [{ id: 'm', start: '09:30', end: '11:30', canMove: false }] });
    for (const item of micros(result)) {
      const start = minute(item);
      expect(start >= toMinutes('09:30') && start < toMinutes('11:30')).toBe(false);
      expect(start >= toMinutes('14:00') && start < toMinutes('15:00')).toBe(false);
    }
  });

  it('uses discreet exercises when a pause falls in a meeting where the user can move', () => {
    const result = plan({
      schedule: makeSchedule({ lunch: undefined, breaks: [] }),
      meetings: [{ id: 'm', start: '09:00', end: '17:00', canMove: true }],
    });
    const inMeeting = micros(result).filter((item) => item.slot === 'meeting');
    expect(inMeeting.length).toBeGreaterThan(0);
    for (const item of inMeeting) {
      for (const id of exerciseIdsOf(item, CATALOG)) {
        expect(CATALOG.exercises.find((exercise) => exercise.id === id)?.meetingFriendly).not.toBe(
          'no',
        );
      }
    }
  });

  it('plans only the rest of the day when the app is opened late', () => {
    const from = atTime(DATE, '13:00');
    const result = plan({ from });
    // 13:00–14:00 + 15:00–17:00 = 3 h, normal → 2 pauses.
    expect(result.targetMicroCount).toBe(2);
    for (const item of result.activities) expect(item.scheduledAt).toBeGreaterThanOrEqual(from);
  });

  it('plans nothing after the workday is over', () => {
    const result = plan({ from: atTime(DATE, '18:00') });
    expect(result.activities).toEqual([]);
  });

  it('is reproducible, and a reroll gives another valid plan', () => {
    expect(plan()).toEqual(plan());
    const rerolled = plan({ rerollCount: 1 });
    expect(rerolled.rerollCount).toBe(1);
    expect(rerolled).not.toEqual(plan());
  });

  it('proposes another main activity on "Otra misión"', () => {
    const first = mainOf(plan())!;
    const firstId = first.content.kind === 'main' ? first.content.activityId : '';
    const other = mainOf(plan({ excludeMainActivityId: firstId }))!;
    expect(other.content).not.toEqual(first.content);
  });

  it('creates untouched pending activities with stable ids', () => {
    const result = plan();
    for (const item of result.activities) {
      expect(item).toMatchObject({
        origin: 'plan',
        status: 'pending',
        remindersSent: 0,
        postponeMinutes: 0,
        postponeCount: 0,
      });
      expect(item.currentScheduledAt).toBe(item.scheduledAt);
      expect(item.id.startsWith(`${DATE}:`)).toBe(true);
    }
    expect(new Set(result.activities.map((item) => item.id)).size).toBe(result.activities.length);
  });

  it('makes most pauses short micros and some combined resets', () => {
    const types = micros(plan({ schedule: makeSchedule({ lunch: undefined, breaks: [] }) })).map(
      (item) => item.pauseType,
    );
    expect(types.filter((type) => type === 'micro').length).toBeGreaterThan(types.length / 2);
    expect(types).toContain('reset');
  });
});

describe('generateDayPlan: what the pauses ask for', () => {
  const exercise = (id: string) => CATALOG.exercises.find((item) => item.id === id)!;
  const movesOf = (item: ScheduledActivity): Exercise[] =>
    exerciseIdsOf(item, CATALOG).map(exercise);
  /** Six weeks of plans with the default workday and these settings. */
  const weeks = (overrides: Partial<UserSettings>, extra: Partial<PlanInput> = {}) =>
    Array.from({ length: 42 }, (_, index) =>
      generateDayPlan({
        date: addDays(DATE, index),
        schedule: settings.schedule,
        settings: { ...settings, ...overrides },
        catalog: CATALOG,
        ...extra,
      }),
    ).flatMap(micros);
  const share = (items: ScheduledActivity[], test: (item: ScheduledActivity) => boolean) =>
    items.filter(test).length / items.length;
  const getsUp = (item: ScheduledActivity) =>
    movesOf(item).some((move) => move.posture === 'standing');
  /** The main activity takes one break; the other gets a pause. */
  const TWO_BREAKS = makeSchedule({
    breaks: [
      { start: '11:00', durationMin: 15 },
      { start: '16:00', durationMin: 15 },
    ],
  });
  const aimsAt = (area: string) => (item: ScheduledActivity) =>
    movesOf(item).some((move) => move.areas[0] === area);

  it('plans a full day without any equipment', () => {
    const result = plan({ settings: { ...settings, equipment: [] } });
    expect(micros(result)).toHaveLength(result.targetMicroCount);
    for (const item of micros(result)) {
      for (const move of movesOf(item)) expect(move.equipment).toEqual([]);
    }
    const main = mainOf(result)!;
    const activity = CATALOG.mainActivities.find(
      (item) => main.content.kind === 'main' && item.id === main.content.activityId,
    );
    expect(activity?.equipment).toEqual([]);
  });

  it.each(['resistance_band', 'dumbbells', 'kettlebell', 'mat'])(
    'brings in content for %s once it is at hand, without making it the norm',
    (item) => {
      const needsIt = (activity: ScheduledActivity) =>
        activity.content.kind === 'main'
          ? CATALOG.mainActivities
              .find(
                (entry) =>
                  activity.content.kind === 'main' && entry.id === activity.content.activityId,
              )!
              .equipment.includes(item)
          : movesOf(activity).some((move) => move.equipment.includes(item));
      const days = (equipment: string[]) =>
        Array.from({ length: 42 }, (_, index) =>
          generateDayPlan({
            date: addDays(DATE, index),
            schedule: TWO_BREAKS,
            settings: { ...settings, equipment },
            catalog: CATALOG,
          }),
        ).flatMap((day) => day.activities);
      expect(days([]).some(needsIt)).toBe(false);
      const activities = days([item]);
      expect(activities.some(needsIt)).toBe(true);
      const pauses = activities.filter((activity) => activity.kind === 'micro');
      expect(share(pauses, needsIt)).toBeLessThan(0.35);
    },
  );

  it('keeps floor work for breaks, and rare', () => {
    const pauses = weeks({ equipment: ['mat'] }, { schedule: TWO_BREAKS });
    const floor = pauses.filter((item) => movesOf(item).some((move) => move.posture === 'floor'));
    expect(floor.length).toBeGreaterThan(0);
    expect(floor.every((item) => item.slot === 'break')).toBe(true);
    expect(floor.length / pauses.length).toBeLessThan(0.2);
  });

  it('respects meetingFriendly: quiet or movable moves in a "puedo moverme" meeting, never "no"', () => {
    const pauses = weeks(
      { equipment: CATALOG.equipment.map((item) => item.id) },
      {
        schedule: makeSchedule({ lunch: undefined, breaks: [] }),
        meetings: [{ id: 'm', start: '09:00', end: '17:00', canMove: true }],
      },
    );
    const moves = pauses.filter((item) => item.slot === 'meeting').flatMap(movesOf);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((move) => move.meetingFriendly !== 'no' && move.posture !== 'floor')).toBe(
      true,
    );
    expect(new Set(moves.map((move) => move.meetingFriendly))).toEqual(new Set(['yes', 'partial']));
  });

  it("plans nothing during a meeting where the user can't move", () => {
    const busy = { start: toMinutes('10:00'), end: toMinutes('12:30') };
    const pauses = weeks(
      {},
      { meetings: [{ id: 'm', start: '10:00', end: '12:30', canMove: false }] },
    );
    for (const item of pauses) {
      const start = minute(item);
      expect(overlaps({ start, end: start + Math.ceil(item.durationSec / 60) }, busy)).toBe(false);
    }
  });

  it('gives high-rated areas more attention without losing general movement', () => {
    const flat = weeks({ discomfort: {} });
    const neck = weeks({ discomfort: { neck: 5 } });
    expect(share(neck, aimsAt('neck'))).toBeGreaterThan(1.5 * share(flat, aimsAt('neck')));

    // Getting up doesn't depend on the sliders: about every other pause at the desk.
    const atDesk = (items: ScheduledActivity[]) => items.filter((item) => item.slot !== 'break');
    for (const pauses of [flat, neck, weeks({ discomfort: { eyes: 5, wrists: 5, neck: 5 } })]) {
      expect(share(atDesk(pauses), getsUp)).toBeGreaterThanOrEqual(0.5);
    }
  });

  it('gets the user up in the first pause of the day and in every combined reset', () => {
    const pauses = weeks(
      { discomfort: { eyes: 5 } },
      { schedule: makeSchedule({ lunch: undefined, breaks: [] }) },
    );
    const firsts = pauses.filter((item) => item.id.endsWith(':p0'));
    expect(firsts.every(getsUp)).toBe(true);
    const resets = pauses.filter(
      (item) => item.content.kind === 'exercises' && item.pauseType === 'reset',
    );
    expect(resets.length).toBeGreaterThan(0);
    expect(resets.every(getsUp)).toBe(true);
  });
});

describe('microbreakViolations (test helper)', () => {
  it('catches broken plans, so the properties below are meaningful', () => {
    const valid = plan();
    expect(microbreakViolations(valid, CATALOG, { from: 540, equipment: [] })).toEqual([]);
    const [first, second] = micros(valid);
    const broken: DayPlan = {
      ...valid,
      activities: valid.activities.map((item) => {
        if (item.id === first!.id) return { ...item, currentScheduledAt: atTime(DATE, '14:10') };
        if (item.id === second!.id) return { ...item, currentScheduledAt: atTime(DATE, '14:20') };
        return item;
      }),
    };
    const issues = microbreakViolations(broken, CATALOG, { from: 540, equipment: [] });
    expect(issues.some((issue) => issue.includes('in lunch'))).toBe(true);
    expect(issues.some((issue) => issue.includes('only 10 min'))).toBe(true);
  });
});

describe('generateDayPlan (properties)', () => {
  const inputArb = scheduleArb.chain((schedule) =>
    fc.record({
      schedule: fc.constant(schedule),
      meetings: meetingsArb(schedule),
      intensity: intensityArb,
      discomfort: discomfortArb,
      equipment: equipmentArb,
      preferredMainActivityMin: fc.constantFrom(5, 10, 20, 30),
      rerollCount: fc.nat({ max: 3 }),
      lateBy: fc.option(fc.integer({ min: 0, max: 300 }), { nil: undefined }),
    }),
  );

  it('respects every hard rule on any valid day', () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const workStart = toMinutes(input.schedule.workStart);
        const from = input.lateBy === undefined ? workStart : workStart + input.lateBy;
        const result = generateDayPlan({
          date: DATE,
          schedule: input.schedule,
          meetings: input.meetings,
          settings: input,
          catalog: CATALOG,
          rerollCount: input.rerollCount,
          from: input.lateBy === undefined ? undefined : atTime(DATE, '00:00') + from * 60_000,
        });
        const fromRounded = Math.max(Math.ceil(from / 5) * 5, workStart);
        expect(
          microbreakViolations(result, CATALOG, { from: fromRounded, equipment: input.equipment }),
        ).toEqual([]);
        expect(micros(result).length).toBeLessThanOrEqual(result.targetMicroCount);
      }),
      { numRuns: 300 },
    );
  });

  it('never repeats an exercise in consecutive pauses', () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const result = generateDayPlan({
          date: DATE,
          schedule: input.schedule,
          meetings: input.meetings,
          settings: input,
          catalog: CATALOG,
        });
        const pauses = micros(result);
        pauses.forEach((item, index) => {
          if (index === 0) return;
          const shared = exerciseIdsOf(item, CATALOG).filter((id) =>
            exerciseIdsOf(pauses[index - 1]!, CATALOG).includes(id),
          );
          expect(shared, `${pauses[index - 1]!.id} → ${item.id}`).toEqual([]);
        });
      }),
      { numRuns: 200 },
    );
  });

  it('places the main activity in a valid moment for it', () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const result = generateDayPlan({
          date: DATE,
          schedule: input.schedule,
          meetings: input.meetings,
          settings: input,
          catalog: CATALOG,
        });
        const main = mainOf(result);
        if (!main) return;
        const timeline = buildTimeline(input.schedule, input.meetings);
        const activityId = main.content.kind === 'main' ? main.content.activityId : '';
        const activity = CATALOG.mainActivities.find((item) => item.id === activityId)!;
        const span = { start: minute(main), end: minute(main) + main.durationSec / 60 };
        expect(activity.slots).toContain(main.slot);
        expect(activity.equipment.every((tool) => input.equipment.includes(tool))).toBe(true);
        expect(span.start).toBeGreaterThanOrEqual(timeline.workStart);
        expect(span.end).toBeLessThanOrEqual(timeline.workEnd);
        if (timeline.lunch) expect(overlaps(span, timeline.lunch)).toBe(false);
        for (const meeting of timeline.busyMeetings) expect(overlaps(span, meeting)).toBe(false);
      }),
      { numRuns: 200 },
    );
  });

  it('is deterministic', () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const make = () =>
          generateDayPlan({
            date: DATE,
            schedule: input.schedule,
            meetings: input.meetings,
            settings: input,
            catalog: CATALOG,
            rerollCount: input.rerollCount,
          });
        expect(make()).toEqual(make());
      }),
      { numRuns: 50 },
    );
  });

  it('only proposes main activities the user has the equipment for', () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const result = generateDayPlan({
          date: DATE,
          schedule: input.schedule,
          meetings: input.meetings,
          settings: input,
          catalog: CATALOG,
          rerollCount: input.rerollCount,
        });
        const main = mainOf(result);
        if (main?.content.kind !== 'main') return;
        const activityId = main.content.activityId;
        const activity = CATALOG.mainActivities.find((item) => item.id === activityId)!;
        for (const item of activity.equipment) expect(input.equipment).toContain(item);
        if (activityId === 'standing_work') expect(input.equipment).toContain('standing_desk');
      }),
      { numRuns: 300 },
    );
  });
});
