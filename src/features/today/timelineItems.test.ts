import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { timelineItems } from './timelineItems';

describe('timelineItems', () => {
  it('lists the whole day in time order, opening and closing it', () => {
    const plan = generateDayPlan({
      date: '2026-10-05',
      schedule: DEFAULT_SETTINGS.schedule,
      meetings: [{ id: 'm1', start: '10:00', end: '10:30', canMove: true }],
      settings: DEFAULT_SETTINGS,
      catalog: CATALOG,
    });
    const items = timelineItems(plan);
    const kinds = items.map((item) => item.kind);
    expect(kinds[0]).toBe('workStart');
    expect(kinds.at(-1)).toBe('workEnd');
    expect(kinds).toEqual(expect.arrayContaining(['break', 'lunch', 'meeting', 'main', 'pause']));
    expect(items.filter((item) => item.kind === 'pause')).toHaveLength(
      plan.activities.filter((item) => item.kind === 'micro').length,
    );
    const times = items.map((item) => item.at);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});
