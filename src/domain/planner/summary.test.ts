import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { atTime } from '../time';
import type { ActivitySlot, DayPlan } from '../types';
import { createActivity } from './activities';
import { summarizePlan } from './summary';

const DATE = '2026-10-05';
const pause = (index: number, slot: ActivitySlot, durationSec: number) =>
  createActivity({
    id: `${DATE}:p${index}`,
    kind: 'micro',
    content: { kind: 'exercises', exerciseIds: ['chin_tuck'] },
    pauseType: 'micro',
    slot,
    durationSec,
    at: atTime(DATE, '10:00') + index * 3_600_000,
  });
const main = (activityId: string, slot: ActivitySlot) =>
  createActivity({
    id: `${DATE}:main`,
    kind: 'main',
    content: { kind: 'main', activityId },
    slot,
    durationSec: 900,
    at: atTime(DATE, '11:30'),
  });
const plan = (activities: DayPlan['activities']): DayPlan => ({
  date: DATE,
  schedule: { workStart: '09:00', workEnd: '17:00', breaks: [] },
  meetings: [],
  rerollCount: 0,
  targetMicroCount: 3,
  activities,
});

describe('summarizePlan', () => {
  it('counts only pauses in work time as interruption', () => {
    const summary = summarizePlan(
      plan([pause(0, 'work', 40), pause(1, 'break', 120), pause(2, 'meeting', 30)]),
      CATALOG,
    );
    expect(summary.microCount).toBe(3);
    expect(summary.movementSec).toBe(190);
    expect(summary.interruptionSec).toBe(40);
  });

  it('counts a main activity in work time unless it is done while working', () => {
    expect(summarizePlan(plan([main('walk_indoors', 'work')]), CATALOG).interruptionSec).toBe(900);
    expect(summarizePlan(plan([main('standing_work', 'work')]), CATALOG).interruptionSec).toBe(0);
    expect(summarizePlan(plan([main('walk_outside', 'break')]), CATALOG).interruptionSec).toBe(0);
  });

  it('exposes the main activity', () => {
    const summary = summarizePlan(plan([main('walk_outside', 'break')]), CATALOG);
    expect(summary.main?.content).toEqual({ kind: 'main', activityId: 'walk_outside' });
  });
});
