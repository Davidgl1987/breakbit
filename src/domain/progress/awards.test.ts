import { describe, expect, it } from 'vitest';
import { createActivity } from '../planner/activities';
import { atTime } from '../time';
import type { ScheduledActivity } from '../types';
import { pauseCompletionXp, withAwards } from './awards';

const DATE = '2026-10-05';
const AT = atTime(DATE, '10:00');
const done = (patch: Partial<ScheduledActivity> = {}): ScheduledActivity => ({
  ...createActivity({
    id: `${DATE}:p0`,
    kind: 'micro',
    content: { kind: 'exercises', exerciseIds: ['neck_rotation'] },
    slot: 'work',
    durationSec: 40,
    at: AT,
  }),
  status: 'completed',
  startedAt: AT,
  completedAt: AT + 40_000,
  ...patch,
});
const amounts = (entries: { key: string; amount: number }[]) =>
  Object.fromEntries(entries.map((entry) => [entry.key, entry.amount]));

describe('pauseCompletionXp', () => {
  it('gives +100 for a planned pause and +20 more at the first prompt', () => {
    expect(
      amounts(pauseCompletionXp(done({ firstPrompt: true }), { returnBonus: false }, AT)),
    ).toEqual({
      [`micro:${DATE}:p0`]: 100,
      [`first:${DATE}:p0`]: 20,
    });
    expect(
      amounts(pauseCompletionXp(done({ firstPrompt: false }), { returnBonus: false }, AT)),
    ).toEqual({
      [`micro:${DATE}:p0`]: 100,
    });
  });

  it('multiplies only the base on the return day', () => {
    expect(
      amounts(pauseCompletionXp(done({ firstPrompt: true }), { returnBonus: true }, AT)),
    ).toEqual({
      [`micro:${DATE}:p0`]: 150,
      [`first:${DATE}:p0`]: 20,
    });
  });

  it('gives a recovered pause its base, without the first-prompt bonus or multiplier', () => {
    const recovered = done({ origin: 'recovery', firstPrompt: true });
    expect(amounts(pauseCompletionXp(recovered, { returnBonus: true }, AT))).toEqual({
      [`micro:${DATE}:p0`]: 100,
    });
  });

  it('gives nothing for pauses not completed', () => {
    expect(pauseCompletionXp(done({ status: 'missed' }), { returnBonus: false }, AT)).toEqual([]);
  });
});

describe('withAwards', () => {
  it('never counts the same award twice', () => {
    const entries = pauseCompletionXp(done({ firstPrompt: true }), { returnBonus: false }, AT);
    const ledger = withAwards([], entries);
    expect(withAwards(ledger, entries)).toEqual(ledger);
    expect(ledger).toHaveLength(2);
  });
});
