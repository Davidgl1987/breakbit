import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { addDays, atTime } from '@/domain/time';
import type { DailySummary, DateKey, DayRecord } from '@/domain/types';
import { useAppStore } from '../store';

const store = () => useAppStore.getState();
const closed = (date: DateKey, isGood: boolean): DayRecord => ({
  date,
  status: 'closed',
  returnBonus: false,
  recoveryUsed: false,
  summary: { isGood } as DailySummary,
});

beforeEach(() => {
  store().completeOnboarding(DEFAULT_SETTINGS);
  useAppStore.setState({
    onboardedAt: atTime('2026-10-05', '09:00'),
    days: Object.fromEntries(
      [0, 1, 2, 3, 4].map((i) => {
        const date = addDays('2026-10-05', i);
        return [date, closed(date, i < 4)];
      }),
    ),
  });
});

describe('progress actions', () => {
  it('evaluates the week once it is over and evolves the avatar', () => {
    store().evaluateWeeks(atTime('2026-10-11', '20:00'));
    expect(store().progress.weeklyResults).toEqual([]);

    store().evaluateWeeks(atTime('2026-10-12', '09:00'));
    expect(store().progress).toMatchObject({
      evolutionPhase: 2,
      lastEvaluatedWeek: '2026-W41',
      weeklyResults: [{ week: '2026-W41', good: 4, planned: 5, result: 'good' }],
    });
  });

  it('remembers which result has been seen', () => {
    store().evaluateWeeks(atTime('2026-10-12', '09:00'));
    store().markWeekSeen('2026-W41');
    expect(store().progress.lastSeenWeek).toBe('2026-W41');
    // An older week never moves it back.
    store().markWeekSeen('2026-W40');
    expect(store().progress.lastSeenWeek).toBe('2026-W41');
  });

  it('waits for the onboarding', () => {
    useAppStore.setState({ onboardedAt: undefined });
    store().evaluateWeeks(atTime('2026-10-20', '09:00'));
    expect(store().progress.weeklyResults).toEqual([]);
  });
});
