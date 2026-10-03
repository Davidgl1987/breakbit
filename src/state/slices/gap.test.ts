import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { proposeGap, type GapOption } from '@/domain/gap/gap';
import type { HHmm, ScheduledActivity } from '@/domain/types';
import { clock } from '@/services/clock';
import { clearEvents, readEvents } from '@/services/eventLog';
import { SAMPLE_DATE as DATE, sampleAt as at, sampleDay } from '@/test/sampleDay';
import { useAppStore } from '../store';

const store = () => useAppStore.getState();
const activity = (id: string): ScheduledActivity =>
  store().days[DATE]!.plan!.activities.find((item) => item.id === id)!;
const xp = () => store().xpLedger.map((entry) => [entry.key, entry.amount]);
/** The proposal the screen would show, taken at `time`. */
function take(option: GapOption, time: HHmm) {
  clock.travelTo(at(time));
  const proposal = proposeGap(
    store().days[DATE]!.plan!,
    option,
    clock.now(),
    {
      catalog: CATALOG,
      discomfort: DEFAULT_SETTINGS.discomfort,
      equipment: [],
      ledger: store().xpLedger,
    },
    'seed',
  )!;
  return { proposal, id: store().takeGap(DATE, option, proposal) };
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

beforeEach(async () => {
  await clearEvents();
  store().completeOnboarding(DEFAULT_SETTINGS);
  store().startDay(sampleDay());
});
afterEach(() => clock.setOffset(0));

describe('gap actions', () => {
  it('starts the pause that was waiting', async () => {
    store().reconcile(at('10:02'));
    const { proposal, id } = take('m1', '10:05');
    expect(proposal.kind).toBe('due');
    expect(id).toBe(`${DATE}:p0`);
    expect(activity(id!).startedAt).toBeDefined();
    await settle();
    const events = await readEvents();
    // Written in the same millisecond: found by type, not by order.
    expect(events.find((event) => event.type === 'spontaneous_break')).toMatchObject({
      type: 'spontaneous_break',
      data: { option: 'm1', outcome: 'due' },
    });
  });

  it('does the next pause now: it counts as planned, without the first-try bonus', () => {
    const { proposal, id } = take('m3', '09:40');
    expect(proposal.kind).toBe('advance');
    expect(id).toBe(`${DATE}:p0`);
    expect(activity(id!)).toMatchObject({ origin: 'plan', firstPrompt: false });

    store().completePause(DATE, id!, 120);
    expect(xp()).toEqual([[`micro:${id}`, 100]]);
  });

  it('adds extra pauses: +10 XP, but not right after moving', () => {
    const first = take('m1', '09:20');
    expect(first.proposal.kind).toBe('extra');
    expect(first.id).toBe(`${DATE}:g0`);
    clock.travelTo(at('09:21'));
    store().completePause(DATE, first.id!, 40);
    expect(xp()).toEqual([[`extra:${first.id}`, 10]]);

    const second = take('s30', '09:25');
    expect(second.proposal).toMatchObject({ kind: 'extra', noXp: 'cooldown' });
    clock.travelTo(at('09:26'));
    store().completePause(DATE, second.id!, 25);
    expect(xp()).toEqual([[`extra:${first.id}`, 10]]);
    // Extras don't move the plan.
    expect(activity(`${DATE}:p0`).currentScheduledAt).toBe(at('10:00'));
  });

  it('leaves the main activity to its own action', () => {
    const { proposal, id } = take('m10', '09:20');
    expect(proposal.kind).toBe('main');
    expect(id).toBeUndefined();
  });
});
