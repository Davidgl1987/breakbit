import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { weekdayOf } from '../time';
import type { DailySummary, DateKey, DayRecord, DayStatus } from '../types';
import { currentStreak } from './streak';

// Monday 5 – Sunday 11 October 2026; workdays Monday to Friday.
const TODAY: DateKey = '2026-10-09';
const isWorkday = (date: DateKey) => weekdayOf(date) <= 5;

function record(date: DateKey, status: DayStatus, isGood = true): DayRecord {
  return {
    date,
    status,
    returnBonus: false,
    recoveryUsed: false,
    ...(status === 'closed' && { summary: { isGood } as DailySummary }),
  };
}

const streak = (
  days: Partial<Record<DateKey, DayRecord>>,
  { today = TODAY, since = '2026-09-01' as DateKey } = {},
) => currentStreak({ today, since, days, isWorkday, catalog: CATALOG });

describe('currentStreak', () => {
  it('counts consecutive good workdays and stops at a bad one', () => {
    expect(
      streak({
        '2026-10-05': record('2026-10-05', 'closed', false),
        '2026-10-06': record('2026-10-06', 'closed'),
        '2026-10-07': record('2026-10-07', 'closed'),
        '2026-10-08': record('2026-10-08', 'closed'),
      }),
    ).toBe(3);
  });

  it('skips weekends and days off without breaking', () => {
    expect(
      streak(
        {
          '2026-10-02': record('2026-10-02', 'closed'),
          '2026-10-05': record('2026-10-05', 'day_off'),
          '2026-10-06': record('2026-10-06', 'closed'),
        },
        { today: '2026-10-07' },
      ),
    ).toBe(2);
  });

  it('breaks on an absent day and on a workday never opened', () => {
    expect(
      streak({
        '2026-10-07': record('2026-10-07', 'absent'),
        '2026-10-08': record('2026-10-08', 'closed'),
      }),
    ).toBe(1);
    expect(streak({ '2026-10-08': record('2026-10-08', 'closed') })).toBe(1);
  });

  it('does not break while today is still going on', () => {
    const today = { ...record(TODAY, 'active'), plan: undefined };
    expect(streak({ '2026-10-08': record('2026-10-08', 'closed'), [TODAY]: today })).toBe(1);
  });

  it('starts counting on the onboarding day', () => {
    expect(streak({ '2026-10-08': record('2026-10-08', 'closed') }, { since: '2026-10-08' })).toBe(
      1,
    );
  });

  it('treats the onboarding day as neutral when it was not worked', () => {
    expect(
      streak({ '2026-10-08': record('2026-10-08', 'closed') }, { since: '2026-10-07' as DateKey }),
    ).toBe(1);
    expect(streak({}, { since: '2026-10-07' as DateKey })).toBe(0);
  });
});
