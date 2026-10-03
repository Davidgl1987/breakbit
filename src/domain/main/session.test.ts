import { describe, expect, it } from 'vitest';
import { createActivity } from '../planner/activities';
import { atTime } from '../time';
import type { ScheduledActivity } from '../types';
import {
  advanceMain,
  completeMain,
  isMainRunning,
  mainElapsedSec,
  mainEndsAt,
  pauseMain,
  startMain,
} from './session';

const DATE = '2026-10-05';
const AT = atTime(DATE, '13:00');
const SEC = 1000;
const MIN = 60 * SEC;
const walk = (patch: Partial<ScheduledActivity> = {}): ScheduledActivity => ({
  ...createActivity({
    id: `${DATE}:main`,
    kind: 'main',
    content: { kind: 'main', activityId: 'walk_outside' },
    slot: 'break',
    durationSec: 20 * 60,
    completionMode: 'continuous',
    at: AT,
  }),
  ...patch,
});

describe('main activity session', () => {
  it('starts at the time it really happens', () => {
    const started = startMain(walk(), AT - 90 * MIN);
    expect(started).toMatchObject({
      startedAt: AT - 90 * MIN,
      currentScheduledAt: AT - 90 * MIN,
      runningSince: AT - 90 * MIN,
      scheduledAt: AT,
    });
    expect(isMainRunning(started)).toBe(true);
  });

  it('adds up its runs, keeping the first start', () => {
    let item = startMain(walk(), AT);
    item = pauseMain(item, AT + 5 * MIN + 400);
    expect(item).toMatchObject({ accumulatedSec: 300, runningSince: undefined });
    expect(isMainRunning(item)).toBe(false);
    // Paused, the time stands still.
    expect(mainElapsedSec(item, AT + 60 * MIN)).toBe(300);

    item = startMain(item, AT + 30 * MIN);
    expect(item).toMatchObject({ startedAt: AT, runningSince: AT + 30 * MIN });
    expect(mainElapsedSec(item, AT + 32 * MIN)).toBe(420);
  });

  it('never counts more than its length', () => {
    const item = startMain(walk(), AT);
    expect(mainElapsedSec(item, AT + 3 * 60 * MIN)).toBe(20 * 60);
    expect(mainElapsedSec(walk(), AT)).toBe(0);
  });

  it('knows when a run makes the time add up', () => {
    const item = startMain(walk({ accumulatedSec: 15 * 60, startedAt: AT }), AT + MIN);
    expect(mainEndsAt(item)).toBe(AT + 6 * MIN);
    expect(mainEndsAt(pauseMain(item, AT + 2 * MIN))).toBeUndefined();
  });

  it('ignores what does not apply', () => {
    const running = startMain(walk(), AT);
    expect(startMain(running, AT + MIN)).toBe(running);
    const idle = walk();
    expect(pauseMain(idle, AT)).toBe(idle);
    const done = completeMain(running, AT + MIN);
    expect(startMain(done, AT + 2 * MIN)).toBe(done);
    expect(pauseMain(done, AT + 2 * MIN)).toBe(done);
    expect(completeMain(done, AT + 3 * MIN)).toBe(done);

    const pause = { ...walk(), kind: 'micro' as const };
    expect(startMain(pause, AT)).toBe(pause);
    expect(completeMain(pause, AT)).toBe(pause);
  });

  it('can be finished early, with the time actually done', () => {
    const done = completeMain(startMain(walk(), AT), AT + 7 * MIN);
    expect(done).toMatchObject({
      status: 'completed',
      completedAt: AT + 7 * MIN,
      elapsedSec: 420,
      runningSince: undefined,
    });
  });

  it('counts its planned time when done without the timer', () => {
    const done = completeMain(walk(), AT + 3 * 60 * MIN);
    expect(done).toMatchObject({
      status: 'completed',
      completedAt: AT + 3 * 60 * MIN,
      elapsedSec: 20 * 60,
    });
    expect(done.startedAt).toBeUndefined();
  });

  it('finishes when the time added up, even if noticed later', () => {
    const item = startMain(walk(), AT);
    expect(advanceMain(item, AT + 19 * MIN)).toBe(item);
    expect(advanceMain(item, AT + 45 * MIN)).toMatchObject({
      status: 'completed',
      completedAt: AT + 20 * MIN,
      elapsedSec: 20 * 60,
    });
  });

  it('never ends on its own while paused or not started', () => {
    const paused = pauseMain(startMain(walk(), AT), AT + MIN);
    expect(advanceMain(paused, AT + 5 * 60 * MIN)).toBe(paused);
    expect(advanceMain(walk(), AT + 5 * 60 * MIN)).toEqual(walk());
  });
});
