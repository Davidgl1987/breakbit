import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSettings } from '@/test/builders';
import { equipmentInPlan } from '../day/today';
import { atTime } from '../time';
import type { DayPlan, EquipmentId, ScheduledActivity } from '../types';
import { activityEquipment, ensureEquipmentUsed } from './ensureEquipment';
import { generateDayPlan } from './generateDayPlan';

const DATE = '2026-10-05';
const settings = makeSettings();
// The default day: gear-free pauses, and the main activity in the 11:00 break.
const plan = generateDayPlan({
  date: DATE,
  schedule: settings.schedule,
  settings,
  catalog: CATALOG,
});
const ensure = (day: DayPlan, equipment: EquipmentId[], from = atTime(DATE, '08:00')) =>
  ensureEquipmentUsed(day, { catalog: CATALOG, discomfort: {}, equipment }, from, 'seed');
const changed = (before: DayPlan, after: DayPlan) =>
  after.activities.filter((item, index) => item !== before.activities[index]);
const usesOf = (day: DayPlan, piece: EquipmentId) =>
  day.activities.filter((item) => activityEquipment(item, CATALOG).includes(piece));

describe('ensureEquipmentUsed', () => {
  it('puts each chosen piece into one pause still to come', () => {
    expect(equipmentInPlan(plan, CATALOG)).toEqual([]);
    const result = ensure(plan, ['kettlebell', 'resistance_band']);
    expect(equipmentInPlan(result, CATALOG)).toEqual(['resistance_band', 'kettlebell']);
    expect(changed(plan, result)).toHaveLength(2);
    for (const item of changed(plan, result)) {
      expect(item.kind).toBe('micro');
      expect(item.durationSec).toBe(
        plan.activities.find((before) => before.id === item.id)!.durationSec,
      );
    }
  });

  it('leaves alone a plan that already uses it', () => {
    const once = ensure(plan, ['dumbbells']);
    expect(ensure(once, ['dumbbells'])).toBe(once);
  });

  it('never changes what already happened, started or is due', () => {
    const from = atTime(DATE, '15:00');
    const result = ensure(plan, ['kettlebell'], from);
    for (const item of changed(plan, result)) {
      expect(item.currentScheduledAt).toBeGreaterThanOrEqual(from);
    }
    const started = {
      ...plan,
      activities: plan.activities.map((item) => ({ ...item, startedAt: item.scheduledAt })),
    };
    expect(ensure(started, ['kettlebell'])).toBe(started);
  });

  it('makes a mat the main activity when no pause falls in a break', () => {
    const result = ensure(plan, ['mat']);
    const main = result.activities.find((item) => item.kind === 'main')!;
    expect(main.content).toEqual({ kind: 'main', activityId: 'mat_mobility' });
    expect(main.slot).toBe('break');
    // As long as the break allows, never longer than the activity.
    expect(main.durationSec).toBe(10 * 60);
  });

  it('leaves out what fits nowhere today', () => {
    // A standing desk is only for standing work, and the break isn't work time.
    expect(ensure(plan, ['standing_desk'])).toBe(plan);
  });

  it("doesn't take the only use of another chosen piece", () => {
    const bandPause: ScheduledActivity = {
      ...plan.activities.find((item) => item.kind === 'micro')!,
      content: { kind: 'exercises', exerciseIds: ['band_row'] },
    };
    const day = {
      ...plan,
      activities: [bandPause, ...plan.activities.filter((item) => item.kind === 'main')],
    };
    const result = ensure(day, ['resistance_band', 'kettlebell']);
    expect(usesOf(result, 'resistance_band')).toEqual([bandPause]);
    expect(result.activities.find((item) => item.kind === 'main')?.content).toEqual({
      kind: 'main',
      activityId: 'kettlebell_block',
    });
  });
});
