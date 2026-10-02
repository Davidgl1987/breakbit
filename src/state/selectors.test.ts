import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { XpEntry } from '@/domain/types';
import { selectDay, selectIsOnboarded, selectTotalXp, useLevel } from './selectors';
import { useAppStore } from './store';

const award = (key: string, amount: number, at: number): XpEntry => ({
  key,
  amount,
  at,
  date: '2026-10-05',
  reason: 'microbreak',
});

describe('selectors', () => {
  it('knows whether onboarding is done', () => {
    expect(selectIsOnboarded(useAppStore.getState())).toBe(false);
    useAppStore.getState().completeOnboarding(DEFAULT_SETTINGS);
    expect(selectIsOnboarded(useAppStore.getState())).toBe(true);
  });

  it('reads a day record', () => {
    useAppStore.setState({
      days: {
        '2026-10-05': {
          date: '2026-10-05',
          status: 'absent',
          returnBonus: false,
          recoveryUsed: false,
        },
      },
    });
    expect(selectDay('2026-10-05')(useAppStore.getState())?.status).toBe('absent');
    expect(selectDay('2026-10-06')(useAppStore.getState())).toBeUndefined();
  });

  it('derives total XP and level from the ledger', async () => {
    useAppStore.setState({ xpLedger: [award('a', 900, 1), award('b', 300, 2)] });
    expect(selectTotalXp(useAppStore.getState())).toBe(1200);

    const { result } = renderHook(() => useLevel());
    expect(result.current).toEqual({ total: 1200, level: 2, current: 200, needed: 1000 });
    await act(async () => useAppStore.setState({ xpLedger: [award('a', 900, 1)] }));
    expect(result.current.level).toBe(1);
  });
});
