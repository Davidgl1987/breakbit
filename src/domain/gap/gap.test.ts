import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSchedule, makeSettings } from '@/test/builders';
import { startMain } from '../main/session';
import { createActivity } from '../planner/activities';
import { extraBreakXp } from '../progress/awards';
import { atTime } from '../time';
import type { DayPlan, HHmm, Meeting, ScheduledActivity, XpEntry } from '../types';
import {
  addExtraPause,
  advancePause,
  extraXpBlock,
  isGapOption,
  lastMovementAt,
  proposeGap,
  type GapContext,
  type GapProposal,
} from './gap';

const DATE = '2026-10-05';
const MIN = 60_000;
const at = (time: HHmm) => atTime(DATE, time);
const settings = makeSettings();
const context: GapContext = {
  catalog: CATALOG,
  discomfort: settings.discomfort,
  equipment: [],
  ledger: [],
};
const pause = (n: number, time: HHmm): ScheduledActivity =>
  createActivity({
    id: `${DATE}:p${n}`,
    kind: 'micro',
    content: { kind: 'exercises', exerciseIds: ['neck_rotation'] },
    slot: 'work',
    durationSec: 40,
    pauseType: 'micro',
    at: at(time),
  });
const walk = createActivity({
  id: `${DATE}:main`,
  kind: 'main',
  content: { kind: 'main', activityId: 'walk_outside' },
  slot: 'work',
  durationSec: 20 * 60,
  completionMode: 'continuous',
  at: at('16:00'),
});
/** 09:00–17:00 with no breaks or lunch: pauses at 10:00, 11:30, 13:00 and 15:00. */
const dayWith = (activities: ScheduledActivity[], meetings: Meeting[] = []): DayPlan => ({
  date: DATE,
  schedule: makeSchedule({ breaks: [], lunch: undefined }),
  meetings,
  rerollCount: 0,
  targetMicroCount: 4,
  activities,
});
const plan = dayWith([pause(0, '10:00'), pause(1, '11:30'), pause(2, '13:00'), pause(3, '15:00')]);
const done = (day: DayPlan, id: string, time: HHmm): DayPlan => ({
  ...day,
  activities: day.activities.map((item) =>
    item.id === id
      ? { ...item, status: 'completed', startedAt: at(time) - 40_000, completedAt: at(time) }
      : item,
  ),
});
const propose = (
  day: DayPlan,
  option: Parameters<typeof proposeGap>[1],
  time: HHmm,
  ledger: XpEntry[] = [],
) => proposeGap(day, option, at(time), { ...context, ledger }, 'seed')!;
const extraEntry = (n: number): XpEntry => ({
  key: `extra:${DATE}:g${n}`,
  amount: 10,
  at: at('09:00'),
  date: DATE,
  reason: 'extra_break',
});

describe('what to do with a gap', () => {
  it('knows its options', () => {
    expect(isGapOption('m3')).toBe(true);
    expect(isGapOption('m5')).toBe(false);
  });

  it('goes for the pause already waiting for an answer', () => {
    expect(propose(plan, 's30', '10:05')).toEqual({ kind: 'due', activity: plan.activities[0] });
  });

  it('does the next pause now when it is close and enough time has passed', () => {
    const proposal = propose(plan, 'm1', '09:40');
    expect(proposal).toMatchObject({ kind: 'advance', target: { id: `${DATE}:p0` } });
  });

  it('is an extra pause too early in the day', () => {
    expect(propose(plan, 'm1', '09:20').kind).toBe('extra');
  });

  it('only advances a pause within 45 minutes', () => {
    const after = done(plan, `${DATE}:p0`, '10:01');
    expect(propose(after, 'm1', '10:45')).toMatchObject({
      kind: 'advance',
      target: { id: `${DATE}:p1` },
    });
    expect(propose(after, 'm1', '10:40').kind).toBe('extra');
  });

  it('never advances right after moving: then it is an extra pause', () => {
    // The next pause is close (11:00), but the last one ended only 29 minutes ago.
    const day = done(dayWith([pause(0, '10:00'), pause(1, '11:00')]), `${DATE}:p0`, '10:01');
    const proposal = propose(day, 'm1', '10:30');
    expect(proposal.kind).toBe('extra');
    expect(proposal).not.toHaveProperty('noXp');
  });

  it('gives an extra pause no XP when the last movement was under 20 minutes ago', () => {
    const after = done(plan, `${DATE}:p0`, '10:01');
    expect(propose(after, 'm1', '10:15')).toMatchObject({ kind: 'extra', noXp: 'cooldown' });
  });

  it('caps the extra pauses with XP per day', () => {
    const ledger = [extraEntry(0), extraEntry(1), extraEntry(2)];
    expect(propose(plan, 'm1', '09:20', ledger)).toMatchObject({ kind: 'extra', noXp: 'cap' });
    expect(propose(plan, 'm1', '09:20', ledger.slice(1)).kind).toBe('extra');
    expect(propose(plan, 'm1', '09:20', ledger.slice(1))).not.toHaveProperty('noXp');
  });

  it('proposes the main activity for 10+ minutes while it is still to do', () => {
    const day = dayWith([...plan.activities, walk]);
    expect(propose(day, 'm10', '09:20')).toEqual({ kind: 'main', activity: walk });
    expect(propose(day, 'm3', '09:20').kind).toBe('extra');

    const running = dayWith([...plan.activities, startMain(walk, at('09:00'))]);
    expect(propose(running, 'm10', '09:20').kind).toBe('extra');
  });

  it('never proposes a main activity that cannot be done now', () => {
    const withMain = (activityId: string, meetings: Meeting[] = []) =>
      dayWith(
        [...plan.activities, { ...walk, content: { kind: 'main' as const, activityId } }],
        meetings,
      );
    // Without its equipment.
    expect(propose(withMain('kettlebell_block'), 'm10', '09:20').kind).toBe('extra');
    expect(
      proposeGap(
        withMain('kettlebell_block'),
        'm10',
        at('09:20'),
        { ...context, equipment: ['kettlebell'] },
        'seed',
      )!.kind,
    ).toBe('main');
    // A walking meeting needs a meeting where one can move; nothing else fits in one.
    const meeting: Meeting = { id: 'm1', start: '09:00', end: '09:45', canMove: true };
    expect(propose(withMain('walking_meeting'), 'm10', '09:20').kind).toBe('extra');
    expect(propose(withMain('walking_meeting', [meeting]), 'm10', '09:20').kind).toBe('main');
    expect(propose(withMain('walk_outside', [meeting]), 'm10', '09:20').kind).not.toBe('main');
  });

  it('fits the content to the time available', () => {
    const seconds = (proposal: GapProposal) =>
      'durationSec' in proposal ? proposal.durationSec : 0;
    const s30 = propose(plan, 's30', '09:20');
    expect(s30).toMatchObject({ content: { kind: 'exercises' }, slot: 'work' });
    expect(seconds(s30)).toBeLessThanOrEqual(30);
    const m1 = propose(plan, 'm1', '09:20');
    expect(seconds(m1)).toBeLessThanOrEqual(60);
    const m3 = propose(plan, 'm3', '09:20');
    expect(m3).toMatchObject({ content: { kind: 'routine' } });
    expect(seconds(m3)).toBeLessThanOrEqual(180);
    const m10 = propose(plan, 'm10', '09:20');
    expect(m10).toMatchObject({ content: { kind: 'routine' } });
    expect(seconds(m10)).toBeGreaterThan(180);
    expect(seconds(m10)).toBeLessThanOrEqual(600);
  });

  it('makes room for floor work and equipment: the user chose this time', () => {
    const withMat = { ...context, equipment: ['mat'] };
    const routines = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const proposal = proposeGap(plan, 'm3', at('09:20'), withMat, `f${seed}`);
      if (proposal && 'content' in proposal && proposal.content.kind === 'routine')
        routines.add(proposal.content.routineId);
    }
    // Work time, yet the mat routine comes up; a planned work pause never offers it.
    expect(routines).toContain('floor_reset');
  });

  it('keeps to quiet moves in a meeting', () => {
    const meeting: Meeting = { id: 'm1', start: '09:00', end: '10:00', canMove: true };
    const day = dayWith([pause(0, '13:00')], [meeting]);
    expect(propose(day, 'm3', '09:20')).toMatchObject({
      slot: 'meeting',
      content: { kind: 'exercises' },
    });
  });

  it('falls back when nothing fits the time exactly', () => {
    // No move as short as 30 s: a single move up to a minute instead.
    const longer = {
      ...context,
      catalog: {
        ...CATALOG,
        exercises: CATALOG.exercises.map((item) => ({
          ...item,
          durationSec: Math.max(item.durationSec, 40),
        })),
      },
    };
    const s30 = proposeGap(plan, 's30', at('09:20'), longer, 'seed');
    expect(s30).toMatchObject({ kind: 'extra', content: { kind: 'exercises' } });
    // No routine longer than a planned pause: a short one for 10+ minutes.
    const short = {
      ...context,
      catalog: {
        ...CATALOG,
        routines: CATALOG.routines.filter((item) => item.id !== 'mobility_5'),
      },
    };
    const m10 = proposeGap(plan, 'm10', at('09:20'), short, 'seed')!;
    expect(m10).toMatchObject({ content: { kind: 'routine' } });
    expect('durationSec' in m10 && m10.durationSec).toBeLessThanOrEqual(180);
  });

  it('has nothing to propose without exercises', () => {
    const empty = { ...context, catalog: { ...CATALOG, exercises: [], routines: [] } };
    expect(proposeGap(plan, 'm1', at('09:20'), empty, 'seed')).toBeUndefined();
  });

  it('avoids the moves of the last pause done', () => {
    const after = done(plan, `${DATE}:p0`, '10:01');
    for (const seed of ['a', 'b', 'c', 'd']) {
      const proposal = proposeGap(after, 'm1', at('10:40'), context, seed)!;
      expect('content' in proposal && proposal.content).not.toEqual({
        kind: 'exercises',
        exerciseIds: ['neck_rotation'],
      });
    }
  });

  it('is stable for the same seed', () => {
    expect(propose(plan, 'm3', '09:20')).toEqual(propose(plan, 'm3', '09:20'));
    const others = ['a', 'b', 'c', 'd', 'e'].map((seed) =>
      JSON.stringify(proposeGap(plan, 'm1', at('09:20'), context, seed)),
    );
    expect(new Set(others).size).toBeGreaterThan(1);
  });
});

describe('taking the gap', () => {
  it('does the next pause now, keeping the rest away from it', () => {
    // A pause at 10:10 would come too soon after one done at 09:40.
    const day = dayWith([pause(0, '10:00'), pause(1, '10:10'), pause(2, '13:00')]);
    const proposal = propose(day, 'm3', '09:40');
    if (proposal.kind !== 'advance') throw new Error('expected an advance');
    const result = advancePause(day, proposal, at('09:40'), context);
    const target = result.activities.find((item) => item.id === `${DATE}:p0`)!;
    expect(target).toMatchObject({
      origin: 'plan',
      content: proposal.content,
      durationSec: proposal.durationSec,
      pauseType: 'active',
      startedAt: at('09:40'),
      currentScheduledAt: at('09:40'),
      scheduledAt: at('10:00'),
      firstPrompt: false,
    });
    const next = result.activities.find((item) => item.id === `${DATE}:p1`)!;
    expect(next.currentScheduledAt - at('09:40')).toBeGreaterThanOrEqual(35 * MIN);
  });

  it('leaves a pause that changed meanwhile alone', () => {
    const proposal = propose(plan, 'm1', '09:40');
    if (proposal.kind !== 'advance') throw new Error('expected an advance');
    const started = {
      ...plan,
      activities: plan.activities.map((item) =>
        item.id === proposal.target.id ? { ...item, startedAt: at('09:39') } : item,
      ),
    };
    expect(advancePause(started, proposal, at('09:40'), context)).toBe(started);
  });

  it('adds an extra pause, started now, without touching the plan', () => {
    const proposal = propose(plan, 'm1', '09:20');
    if (proposal.kind !== 'extra') throw new Error('expected an extra');
    const first = addExtraPause(plan, proposal, at('09:20'));
    expect(first.id).toBe(`${DATE}:g0`);
    const extra = first.plan.activities.find((item) => item.id === first.id)!;
    expect(extra).toMatchObject({
      kind: 'micro',
      origin: 'gap',
      startedAt: at('09:20'),
      scheduledAt: at('09:20'),
    });
    for (const item of plan.activities) expect(first.plan.activities).toContainEqual(item);
    expect(addExtraPause(first.plan, proposal, at('09:30')).id).toBe(`${DATE}:g1`);
  });
});

describe('movement and extra XP', () => {
  it('knows when the user last moved', () => {
    const day = done(done(plan, `${DATE}:p0`, '10:01'), `${DATE}:p1`, '11:31');
    expect(lastMovementAt(day, at('11:00'))).toBe(at('10:01'));
    expect(lastMovementAt(day, at('12:00'))).toBe(at('11:31'));
    expect(lastMovementAt(plan, at('12:00'))).toBeUndefined();
    expect(extraXpBlock(day, [], at('11:40'))).toBe('cooldown');
    expect(extraXpBlock(day, [], at('11:52'))).toBeUndefined();
  });

  it('gives +10 for an extra pause, unless it came too soon or the cap is reached', () => {
    const proposal = propose(plan, 'm1', '09:20');
    if (proposal.kind !== 'extra') throw new Error('expected an extra');
    const { plan: day, id } = addExtraPause(plan, proposal, at('09:20'));
    const completed = done(day, id, '09:21');
    const extra = completed.activities.find((item) => item.id === id)!;

    expect(extraBreakXp(extra, completed, [], at('09:21'))).toEqual([
      { key: `extra:${id}`, amount: 10, at: at('09:21'), date: DATE, reason: 'extra_break' },
    ]);
    expect(
      extraBreakXp(extra, completed, [extraEntry(5), extraEntry(6), extraEntry(7)], at('09:21')),
    ).toEqual([]);

    const soon = done(completed, `${DATE}:p0`, '09:10');
    const tooSoon = { ...extra, startedAt: at('09:20') };
    expect(extraBreakXp(tooSoon, soon, [], at('09:21'))).toEqual([]);
    expect(extraBreakXp(plan.activities[0]!, plan, [], at('09:21'))).toEqual([]);
  });
});
