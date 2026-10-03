import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { createActivity } from '../planner/activities';
import { atTime } from '../time';
import type { ActivitySlot, DayPlan, ScheduledActivity } from '../types';
import { dayProgress } from './progress';

const DATE = '2026-10-05';

function micro(
  index: number,
  patch: Partial<ScheduledActivity> = {},
  slot: ActivitySlot = 'work',
): ScheduledActivity {
  return {
    ...createActivity({
      id: `${DATE}:p${index}`,
      kind: 'micro',
      content: { kind: 'exercises', exerciseIds: ['neck_rotation'] },
      slot,
      durationSec: 40,
      at: atTime(DATE, '10:00') + index * 3_600_000,
    }),
    ...patch,
  };
}

function main(patch: Partial<ScheduledActivity> = {}, activityId = 'walk_outside') {
  return {
    ...createActivity({
      id: `${DATE}:main`,
      kind: 'main',
      content: { kind: 'main', activityId },
      slot: 'work',
      durationSec: 1200,
      at: atTime(DATE, '13:00'),
    }),
    ...patch,
  };
}

const plan = (activities: ScheduledActivity[]): DayPlan => ({
  date: DATE,
  schedule: { workStart: '09:00', workEnd: '17:00', breaks: [] },
  meetings: [],
  rerollCount: 0,
  targetMicroCount: activities.length,
  activities,
});

const done = { status: 'completed' } as const;

describe('dayProgress', () => {
  it.each([
    [4, 6, false],
    [5, 6, true],
    [3, 4, true],
    [6, 8, true],
    [7, 10, true],
    [6, 10, false],
  ])('%i of %i pauses with the main activity: good = %s', (completed, planned, good) => {
    const micros = Array.from({ length: planned }, (_, index) =>
      micro(index, index < completed ? done : {}),
    );
    const progress = dayProgress(plan([...micros, main(done)]), CATALOG);
    expect(progress).toMatchObject({ planned, completed, isGood: good });
  });

  it('needs the main activity for a good day', () => {
    const progress = dayProgress(plan([micro(0, done), micro(1, done), main()]), CATALOG);
    expect(progress).toMatchObject({ isGood: false, isPerfect: false, mainCompleted: false });
  });

  it('is perfect with every pause and the main activity', () => {
    const progress = dayProgress(plan([micro(0, done), micro(1, done), main(done)]), CATALOG);
    expect(progress).toMatchObject({ isGood: true, isPerfect: true });
  });

  it('counts recovered pauses for the goal but not extras', () => {
    const progress = dayProgress(
      plan([
        micro(0, { ...done, origin: 'recovery', missReason: 'window_expired' }),
        micro(1),
        micro(2, { ...done, origin: 'gap' }),
        main(done),
      ]),
      CATALOG,
    );
    expect(progress).toMatchObject({ planned: 2, completed: 1, extras: 1 });
  });

  it('is never good with nothing planned', () => {
    expect(dayProgress(plan([]), CATALOG).isGood).toBe(false);
  });

  it('measures movement and the real interruption', () => {
    const progress = dayProgress(
      plan([
        micro(0, { ...done, elapsedSec: 50 }),
        micro(1, done, 'break'),
        micro(2),
        main({ ...done, elapsedSec: 600 }, 'standing_work'),
      ]),
      CATALOG,
    );
    // Standing work happens while working: it moves you without interrupting.
    expect(progress.movementSec).toBe(50 + 40 + 600);
    expect(progress.interruptionSec).toBe(50);
  });
});
