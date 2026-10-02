import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSchedule } from '@/test/builders';
import { createRng } from '../rng';
import type { Meeting } from '../types';
import { placeChosenMainActivity, placeMainActivity } from './placeMainActivity';
import { buildTimeline } from './timeline';

const at = (h: number, m = 0) => h * 60 + m;
const context = { equipment: [], preferredMin: 20, from: at(9) };
const place = (meetings: Meeting[] = [], schedule = makeSchedule(), extra = {}) =>
  placeMainActivity(
    buildTimeline(schedule, meetings),
    CATALOG.mainActivities,
    { ...context, ...extra },
    createRng('main'),
  );

describe('placeMainActivity', () => {
  it('prefers a break, fitting the activity to its length', () => {
    const placement = place([], makeSchedule({ breaks: [{ start: '11:00', durationMin: 15 }] }));
    expect(placement?.slot).toBe('break');
    expect(placement?.start).toBe(at(11));
    expect(placement?.durationMin).toBeLessThanOrEqual(15);
    expect(placement?.activity.slots).toContain('break');
  });

  it('prefers the longest break', () => {
    const placement = place(
      [],
      makeSchedule({
        breaks: [
          { start: '10:30', durationMin: 10 },
          { start: '16:00', durationMin: 30 },
        ],
      }),
    );
    expect(placement?.start).toBe(at(16));
  });

  it('skips breaks taken by a busy meeting and uses a movable meeting instead', () => {
    const placement = place([
      { id: 'busy', start: '11:00', end: '11:30', canMove: false },
      { id: 'walk', start: '12:00', end: '12:30', canMove: true },
    ]);
    expect(placement?.slot).toBe('meeting');
    expect(placement?.start).toBe(at(12));
    expect(placement?.activity.slots).toContain('meeting');
  });

  it('falls back to the middle of the longest free stretch of work time', () => {
    const placement = place([], makeSchedule({ breaks: [] }));
    expect(placement?.slot).toBe('work');
    expect(placement?.activity.slots).toContain('work');
    // Longest free stretch: 09:00–14:00 (lunch 14–15); centered around 11:30.
    const middle = placement!.start + placement!.durationMin / 2;
    expect(Math.abs(middle - at(11, 30))).toBeLessThanOrEqual(5);
  });

  it('ignores moments that already passed', () => {
    const placement = place([], makeSchedule(), { from: at(12) });
    expect(placement!.start).toBeGreaterThanOrEqual(at(12));
  });

  it('only proposes activities for the equipment the user has', () => {
    for (let seed = 0; seed < 30; seed++) {
      const placement = placeMainActivity(
        buildTimeline(makeSchedule({ breaks: [{ start: '11:00', durationMin: 30 }] })),
        CATALOG.mainActivities,
        { ...context, equipment: ['kettlebell'] },
        createRng(`eq${seed}`),
      );
      expect(placement!.activity.equipment.every((item) => item === 'kettlebell')).toBe(true);
    }
  });
});

describe('placeChosenMainActivity', () => {
  it("keeps the user's choice and derives the slot", () => {
    const timeline = buildTimeline(makeSchedule());
    const placement = placeChosenMainActivity(timeline, CATALOG.mainActivities, {
      activityId: 'walk_outside',
      start: '11:00',
      durationMin: 15,
    });
    expect(placement).toMatchObject({ start: at(11), durationMin: 15, slot: 'break' });
    expect(
      placeChosenMainActivity(timeline, CATALOG.mainActivities, {
        activityId: 'nope',
        start: '11:00',
        durationMin: 15,
      }),
    ).toBeUndefined();
  });
});
