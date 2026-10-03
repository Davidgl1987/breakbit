import { describe, expect, it } from 'vitest';
import { createActivity } from '../planner/activities';
import { atTime } from '../time';
import type { ScheduledActivity } from '../types';
import { completionXp, mainCompletionXp, pauseCompletionXp, withAwards } from './awards';

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

describe('mainCompletionXp', () => {
  const main = (patch: Partial<ScheduledActivity> = {}): ScheduledActivity => ({
    ...createActivity({
      id: `${DATE}:main`,
      kind: 'main',
      content: { kind: 'main', activityId: 'walk_outside' },
      slot: 'break',
      durationSec: 20 * 60,
      completionMode: 'continuous',
      at: AT,
    }),
    status: 'completed',
    completedAt: AT + 20 * 60_000,
    ...patch,
  });

  it('gives +300, once per day', () => {
    expect(mainCompletionXp(main(), { returnBonus: false }, AT)).toEqual([
      { key: `main:${DATE}`, amount: 300, at: AT, date: DATE, reason: 'main_activity' },
    ]);
  });

  it('multiplies it on the return day', () => {
    expect(amounts(mainCompletionXp(main(), { returnBonus: true }, AT))).toEqual({
      [`main:${DATE}`]: 450,
    });
  });

  it('gives nothing until it is done', () => {
    expect(mainCompletionXp(main({ status: 'pending' }), { returnBonus: false }, AT)).toEqual([]);
    expect(mainCompletionXp(done(), { returnBonus: false }, AT)).toEqual([]);
  });

  it('is what any completion of the main activity earns', () => {
    expect(completionXp(main(), { returnBonus: false }, AT)).toEqual(
      mainCompletionXp(main(), { returnBonus: false }, AT),
    );
    expect(completionXp(done(), { returnBonus: false }, AT)).toEqual(
      pauseCompletionXp(done(), { returnBonus: false }, AT),
    );
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
