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
import { microbreakViolations } from '@/test/planInvariants';
import { addMinutes, atTime, fromMinutes, minutesOfDay, toMinutes } from '../time';
import type { DayPlan, DaySchedule, HHmm, Meeting, ScheduledActivity } from '../types';
import { createActivity } from './activities';
import { generateDayPlan } from './generateDayPlan';
import { isContentValidFor, type ContentContext } from './pauseContent';
import { summarizePlan } from './summary';
import { rebalance } from './rebalance';

const DATE = '2026-10-05';
const t = (time: HHmm) => atTime(DATE, time);
const CTX: ContentContext = {
  catalog: CATALOG,
  discomfort: makeSettings().discomfort,
  equipment: ['mat'],
};
const clock = (item: ScheduledActivity | undefined) =>
  item ? fromMinutes(minutesOfDay(item.currentScheduledAt)) : undefined;

function micro(index: number, time: HHmm, overrides: Partial<ScheduledActivity> = {}) {
  return {
    ...createActivity({
      id: `${DATE}:p${index}`,
      kind: 'micro',
      content: { kind: 'exercises', exerciseIds: ['chin_tuck'] },
      pauseType: 'micro',
      slot: 'work',
      durationSec: 40,
      at: t(time),
    }),
    ...overrides,
  };
}

function dayPlan(
  activities: ScheduledActivity[],
  meetings: Meeting[] = [],
  breaks: DaySchedule['breaks'] = [],
): DayPlan {
  return {
    date: DATE,
    schedule: makeSchedule({ breaks }), // 09:00–17:00, lunch 14:00–15:00
    meetings,
    rerollCount: 0,
    targetMicroCount: activities.length,
    activities,
  };
}

const byId = (plan: DayPlan, index: number) =>
  plan.activities.find((item) => item.id === `${DATE}:p${index}`);

describe('rebalance', () => {
  it('leaves a plan alone when nothing changed', () => {
    const plan = dayPlan([micro(0, '10:00'), micro(1, '11:00'), micro(2, '12:00')]);
    expect(rebalance(plan, t('09:30'), CTX)).toBe(plan);
  });

  it('only shifts the next pause if a postpone leaves it too close (35 min)', () => {
    const plan = dayPlan([
      micro(0, '10:00', {
        status: 'postponed',
        currentScheduledAt: t('10:30'),
        postponeMinutes: 30,
      }),
      micro(1, '11:00'),
      micro(2, '12:00'),
    ]);
    const result = rebalance(plan, t('10:05'), CTX);
    expect(clock(byId(result, 1))).toBe('11:05');
    expect(clock(byId(result, 2))).toBe('12:00');
    expect(byId(result, 1)!.scheduledAt).toBe(t('11:00'));
  });

  it('cascades when pauses end up too close together', () => {
    const plan = dayPlan([
      micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:30') }),
      micro(1, '10:50'),
      micro(2, '11:30'),
    ]);
    const result = rebalance(plan, t('10:05'), CTX);
    expect(clock(byId(result, 1))).toBe('11:05');
    expect(clock(byId(result, 2))).toBe('11:40');
  });

  it('loses a pause that no longer fits (no debt)', () => {
    const plan = dayPlan([
      micro(0, '16:00', { status: 'postponed', currentScheduledAt: t('16:20') }),
      micro(1, '16:40'),
    ]);
    const result = rebalance(plan, t('16:05'), CTX);
    expect(byId(result, 1)).toMatchObject({ status: 'missed', missReason: 'no_room' });
  });

  it('moves a pushed pause past lunch, where spacing starts again', () => {
    const plan = dayPlan([
      micro(0, '13:00', { status: 'postponed', currentScheduledAt: t('13:30') }),
      micro(1, '13:45'),
    ]);
    expect(clock(byId(rebalance(plan, t('13:05'), CTX), 1))).toBe('15:00');
  });

  it('brings the next pause 10 min forward after a missed one (10:00 lost, 11:10 → 11:00)', () => {
    const plan = dayPlan([
      micro(0, '09:00', { status: 'completed', completedAt: t('09:01') }),
      micro(1, '10:00', { status: 'missed', missReason: 'window_expired' }),
      micro(2, '11:10'),
    ]);
    const result = rebalance(plan, t('10:31'), CTX);
    expect(clock(byId(result, 2))).toBe('11:00');
    // The missed pause still counts as missed.
    expect(byId(result, 1)?.status).toBe('missed');
  });

  it('pulls the next pause in after one done early, keeping the gap ≤ 90 min', () => {
    const plan = dayPlan([
      micro(0, '10:00', { status: 'completed', completedAt: t('09:15') }),
      micro(1, '11:00'),
      micro(2, '12:20'),
    ]);
    const result = rebalance(plan, t('09:20'), CTX);
    expect(clock(byId(result, 1))).toBe('10:45');
    expect(clock(byId(result, 2))).toBe('12:20');
  });

  it('keeps pauses out of a meeting added mid-day', () => {
    const plan = dayPlan(
      [micro(0, '10:00'), micro(1, '11:00')],
      [{ id: 'm', start: '09:50', end: '10:30', canMove: false }],
    );
    const result = rebalance(plan, t('09:00'), CTX);
    expect(clock(byId(result, 0))).toBe('10:30');
    expect(clock(byId(result, 1))).toBe('11:05');
  });

  it('keeps discreet pauses inside a movable meeting but moves the rest out', () => {
    const plan = dayPlan(
      [micro(0, '10:00', { slot: 'meeting' }), micro(1, '11:00')],
      [
        { id: 'a', start: '09:45', end: '10:30', canMove: true },
        { id: 'b', start: '10:50', end: '11:30', canMove: true },
      ],
    );
    const result = rebalance(plan, t('09:00'), CTX);
    expect(clock(byId(result, 0))).toBe('10:00');
    expect(clock(byId(result, 1))).toBe('11:30');
  });

  it('respects the main activity and the gap after it', () => {
    const main = createActivity({
      id: `${DATE}:main`,
      kind: 'main',
      content: { kind: 'main', activityId: 'walk_outside' },
      slot: 'break',
      durationSec: 20 * 60,
      at: t('12:00'),
    });
    const plan = dayPlan([
      micro(0, '11:00', { status: 'postponed', currentScheduledAt: t('11:30') }),
      micro(1, '12:05'),
      main,
    ]);
    // 11:30 + 35 = 12:05 is inside the walk (12:00–12:20) → after it + 35 min.
    expect(clock(byId(rebalance(plan, t('11:10'), CTX), 1))).toBe('12:55');
  });

  it('never touches pauses that are due, done, skipped or missed', () => {
    const plan = dayPlan([
      micro(0, '10:00', { status: 'completed', completedAt: t('10:02') }),
      micro(1, '10:40', { status: 'skipped' }),
      micro(2, '11:00', { status: 'notification_sent', notificationSentAt: t('11:00') }),
      micro(3, '11:20'),
    ]);
    const result = rebalance(plan, t('11:05'), CTX);
    for (const index of [0, 1, 2]) expect(byId(result, index)).toBe(byId(plan, index));
    expect(clock(byId(result, 3))).toBe('11:35');
  });

  it('does nothing once the day is over (closing the day is not its job)', () => {
    const plan = dayPlan([micro(0, '16:00')]);
    expect(rebalance(plan, atTime('2026-10-06', '09:00'), CTX)).toBe(plan);
  });
});

describe('rebalance: context changes', () => {
  const coffee = [{ start: '11:00' as HHmm, durationMin: 15 }];
  const exercisesOf = (item: ScheduledActivity | undefined) =>
    item?.content.kind === 'exercises' ? item.content.exerciseIds : [];

  it('break → work: replaces content that only suits a break (floor work)', () => {
    const plan = dayPlan(
      [
        micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:50') }),
        micro(1, '11:00', {
          slot: 'break',
          content: { kind: 'exercises', exerciseIds: ['cat_cow_mat', 'child_pose'] },
          durationSec: 95,
          pauseType: 'reset',
        }),
      ],
      [],
      coffee,
    );
    const moved = byId(rebalance(plan, t('10:05'), CTX), 1)!;
    expect(clock(moved)).toBe('11:25');
    expect(moved.slot).toBe('work');
    expect(isContentValidFor(moved.content, 'work', CTX)).toBe(true);
    expect(exercisesOf(moved)).not.toContain('cat_cow_mat');
    // Same size of pause, with duration and type matching the new content.
    const total = exercisesOf(moved).reduce(
      (sum, id) => sum + CATALOG.exercises.find((exercise) => exercise.id === id)!.durationSec,
      0,
    );
    expect(moved.durationSec).toBe(total);
    expect(moved.pauseType).toBe('reset');
  });

  it('break → work: keeps a routine that also works at the desk', () => {
    const routine = micro(1, '11:00', {
      slot: 'break',
      content: { kind: 'routine', routineId: 'desk_reset' },
      durationSec: 120,
      pauseType: 'reset',
    });
    const plan = dayPlan(
      [micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:50') }), routine],
      [],
      coffee,
    );
    const moved = byId(rebalance(plan, t('10:05'), CTX), 1)!;
    expect(moved.slot).toBe('work');
    expect(moved.content).toEqual(routine.content);
    expect(moved.durationSec).toBe(120);
  });

  it('work → break: takes the break slot and keeps content that fits it', () => {
    const plan = dayPlan(
      [
        micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:25') }),
        micro(1, '10:45'),
      ],
      [],
      [{ start: '11:00', durationMin: 30 }],
    );
    const moved = byId(rebalance(plan, t('10:05'), CTX), 1)!;
    expect(clock(moved)).toBe('11:00');
    expect(moved.slot).toBe('break');
    expect(moved.content).toEqual(byId(plan, 1)!.content);
  });

  it('counts interruption with the real slot after a move', () => {
    const toBreak = dayPlan(
      [
        micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:25') }),
        micro(1, '10:45'),
      ],
      [],
      [{ start: '11:00', durationMin: 30 }],
    );
    expect(summarizePlan(toBreak, CATALOG).interruptionSec).toBe(80);
    expect(summarizePlan(rebalance(toBreak, t('10:05'), CTX), CATALOG).interruptionSec).toBe(40);

    const toWork = dayPlan(
      [
        micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:50') }),
        micro(1, '11:00', { slot: 'break', durationSec: 40 }),
      ],
      [],
      coffee,
    );
    expect(summarizePlan(toWork, CATALOG).interruptionSec).toBe(40);
    const moved = rebalance(toWork, t('10:05'), CTX);
    expect(summarizePlan(moved, CATALOG).interruptionSec).toBe(40 + byId(moved, 1)!.durationSec);
  });

  it('moves a pause around a busy meeting into the break right after it', () => {
    const plan = dayPlan(
      [micro(0, '10:40')],
      [{ id: 'm', start: '10:30', end: '11:00', canMove: false }],
      coffee,
    );
    const moved = byId(rebalance(plan, t('09:00'), CTX), 0)!;
    expect(clock(moved)).toBe('11:00');
    expect(moved.slot).toBe('break');
    expect(moved.content).toEqual(byId(plan, 0)!.content);
  });

  it('moves a pause around a busy meeting into work time, keeping suitable content', () => {
    const plan = dayPlan(
      [micro(0, '10:40', { slot: 'break' })],
      [{ id: 'm', start: '10:30', end: '11:30', canMove: false }],
      [{ start: '10:30', durationMin: 15 }],
    );
    const moved = byId(rebalance(plan, t('09:00'), CTX), 0)!;
    expect(clock(moved)).toBe('11:30');
    expect(moved.slot).toBe('work');
    expect(moved.content).toEqual(byId(plan, 0)!.content);
  });

  it('a discreet pause pushed out of its meeting keeps its content in work time', () => {
    const plan = dayPlan(
      [
        micro(0, '09:30', { status: 'postponed', currentScheduledAt: t('10:00') }),
        micro(1, '10:15', { slot: 'meeting' }),
      ],
      [{ id: 'm', start: '10:00', end: '10:30', canMove: true }],
    );
    const moved = byId(rebalance(plan, t('09:35'), CTX), 1)!;
    expect(clock(moved)).toBe('10:35');
    expect(moved.slot).toBe('work');
    expect(moved.content).toEqual(byId(plan, 1)!.content);
  });

  it('is idempotent when content was replaced', () => {
    const plan = dayPlan(
      [
        micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:50') }),
        micro(1, '11:00', {
          slot: 'break',
          content: { kind: 'exercises', exerciseIds: ['glute_bridge'] },
          durationSec: 60,
        }),
      ],
      [],
      coffee,
    );
    const once = rebalance(plan, t('10:05'), CTX);
    expect(rebalance(once, t('10:05'), CTX)).toEqual(once);
  });

  it('keeps the old content if nothing suits the new context', () => {
    const onlyFloor: ContentContext = {
      ...CTX,
      catalog: {
        ...CATALOG,
        exercises: CATALOG.exercises.filter((item) => item.posture === 'floor'),
      },
    };
    const floorPause = micro(1, '11:00', {
      slot: 'break',
      content: { kind: 'exercises', exerciseIds: ['child_pose'] },
    });
    const plan = dayPlan(
      [micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:50') }), floorPause],
      [],
      coffee,
    );
    const moved = byId(rebalance(plan, t('10:05'), onlyFloor), 1)!;
    expect(moved.slot).toBe('work');
    expect(moved.content).toEqual(floorPause.content);
  });

  it('does not touch content when the context did not change', () => {
    const plan = dayPlan([
      micro(0, '10:00', { status: 'postponed', currentScheduledAt: t('10:30') }),
      micro(1, '11:00', {
        content: { kind: 'exercises', exerciseIds: ['cat_cow_mat'] },
      }),
    ]);
    // Already invalid for work, but the slot stays "work": nothing to re-check.
    expect(byId(rebalance(plan, t('10:05'), CTX), 1)!.content).toEqual(byId(plan, 1)!.content);
  });
});

describe('rebalance (properties)', () => {
  const dayArb = scheduleArb.chain((schedule) =>
    fc.record({
      schedule: fc.constant(schedule),
      meetings: meetingsArb(schedule),
      intensity: intensityArb,
      discomfort: discomfortArb,
      equipment: equipmentArb,
      preferredMainActivityMin: fc.constantFrom(10, 20),
    }),
  );

  type DayInput = Parameters<typeof makeSettings>[0] & {
    schedule: DayPlan['schedule'];
    meetings: Meeting[];
  };
  const contextFor = (input: DayInput): ContentContext => ({
    catalog: CATALOG,
    discomfort: makeSettings(input).discomfort,
    equipment: makeSettings(input).equipment,
  });
  const generate = (input: DayInput) =>
    generateDayPlan({
      date: DATE,
      schedule: input.schedule,
      meetings: input.meetings,
      settings: makeSettings(input),
      catalog: CATALOG,
    });

  it('a freshly generated plan is already balanced', () => {
    fc.assert(
      fc.property(dayArb, (input) => {
        const plan = generate(input);
        const beforeWork = atTime(DATE, input.schedule.workStart) - 60_000;
        expect(rebalance(plan, beforeWork, contextFor(input))).toEqual(plan);
      }),
      { numRuns: 200 },
    );
  });

  /** Simulates part of a day: some pauses done, missed or skipped; the current one postponed. */
  const progressArb = dayArb.chain((input) =>
    fc.record({
      input: fc.constant(input),
      nowFraction: fc.double({ min: 0, max: 1, noNaN: true }),
      outcomes: fc.array(fc.constantFrom('completed', 'missed', 'skipped', 'early'), {
        minLength: 12,
        maxLength: 12,
      }),
      postpone: fc.constantFrom(0, 5, 10, 15, 30),
    }),
  );

  it('keeps every hard rule, is idempotent and never touches fixed pauses', () => {
    fc.assert(
      fc.property(progressArb, ({ input, nowFraction, outcomes, postpone }) => {
        const plan = generate(input);
        const start = toMinutes(input.schedule.workStart);
        const end = toMinutes(input.schedule.workEnd);
        const now =
          atTime(DATE, '00:00') + Math.floor(start + nowFraction * (end - start)) * 60_000;

        let micros = 0;
        let postponed = false;
        const progressed: DayPlan = {
          ...plan,
          activities: plan.activities.map((item) => {
            if (item.kind !== 'micro') return item;
            const outcome = outcomes[micros++ % outcomes.length]!;
            if (item.scheduledAt < now) {
              if (outcome === 'missed')
                return { ...item, status: 'missed', missReason: 'window_expired' };
              if (outcome === 'skipped') return { ...item, status: 'skipped' };
              return { ...item, status: 'completed', completedAt: addMinutes(item.scheduledAt, 2) };
            }
            if (!postponed && postpone > 0) {
              postponed = true;
              return {
                ...item,
                status: 'postponed',
                currentScheduledAt: addMinutes(item.scheduledAt, postpone),
                postponeMinutes: postpone,
                postponeCount: 1,
              };
            }
            return item;
          }),
        };

        const once = rebalance(progressed, now, contextFor(input));
        expect(rebalance(once, now, contextFor(input))).toEqual(once);

        for (const item of progressed.activities) {
          const after = once.activities.find((candidate) => candidate.id === item.id)!;
          const movable =
            item.kind === 'micro' && item.status === 'pending' && item.currentScheduledAt > now;
          if (!movable) expect(after).toBe(item);
          else if (after.status === 'pending')
            expect(after.currentScheduledAt).toBeGreaterThan(now);
          else expect(after).toMatchObject({ status: 'missed', missReason: 'no_room' });
        }

        // Pauses still ahead satisfy the same rules as a fresh plan.
        const ahead: DayPlan = {
          ...once,
          activities: once.activities.filter(
            (item) =>
              item.kind === 'main' || (item.status === 'pending' && item.currentScheduledAt > now),
          ),
        };
        expect(
          microbreakViolations(ahead, CATALOG, {
            from: minutesOfDay(now),
            equipment: input.equipment,
          }),
        ).toEqual([]);
      }),
      { numRuns: 300 },
    );
  });
});
