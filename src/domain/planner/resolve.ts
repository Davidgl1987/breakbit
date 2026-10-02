import { PAUSE_SIZE } from '../config';
import type { Interval } from './timeline';

/**
 * Minutes reserved for every microbreak when placing it, whatever its content: the
 * longest pause fits anywhere a pause is placed, so content can change without moving it.
 */
export const PAUSE_RESERVE_MIN = Math.ceil(PAUSE_SIZE.activeMaxSec / 60);

/**
 * - lunch: no pauses; also resets spacing (people stand up to eat).
 * - busy_meeting: no pauses.
 * - move_meeting: only discreet pauses that were chosen for a meeting.
 * - main: the main activity plus its buffers.
 */
export type ZoneKind = 'lunch' | 'busy_meeting' | 'move_meeting' | 'main';

export interface Zone extends Interval {
  kind: ZoneKind;
}

export interface PauseRequest {
  /** Preferred start, in minutes since midnight. */
  desired: number;
  durationMin: number;
  /** Its content works in a meeting marked "puedo moverme". */
  allowMoveMeetings: boolean;
}

export interface ResolveOptions {
  /** Fixed moments of movement (pauses done or committed). Spacing applies to them too. */
  anchors: readonly number[];
  zones: readonly Zone[];
  minGap: number;
  earliest: number;
  /** Every pause must end by this minute (before the end-of-day summary). */
  latestEnd: number;
}

/**
 * Places pauses in order, only ever moving them later: out of forbidden zones and at
 * least `minGap` away from anchors and previously placed pauses (unless lunch sits in
 * between). A pause that no longer fits before `latestEnd` resolves to null.
 */
export function resolvePauseTimes(
  requests: readonly PauseRequest[],
  options: ResolveOptions,
): (number | null)[] {
  const placed: number[] = [];
  const lunches = options.zones.filter((zone) => zone.kind === 'lunch');
  return requests.map((request) => {
    const time = resolveOne(request, [...options.anchors, ...placed], lunches, options);
    if (time !== null) placed.push(time);
    return time;
  });
}

function resolveOne(
  request: PauseRequest,
  anchors: readonly number[],
  lunches: readonly Zone[],
  options: ResolveOptions,
): number | null {
  const latestStart = options.latestEnd - request.durationMin;
  let time = Math.max(request.desired, options.earliest);
  // Every adjustment strictly increases `time`, which is bounded by `latestStart`.
  for (;;) {
    if (time > latestStart) return null;
    const blocking = options.zones.find(
      (zone) =>
        !(zone.kind === 'move_meeting' && request.allowMoveMeetings) &&
        time < zone.end &&
        time + request.durationMin > zone.start,
    );
    if (blocking) {
      time = blocking.end;
      continue;
    }
    const tooClose = anchors.find(
      (anchor) =>
        Math.abs(time - anchor) < options.minGap && !separatedByLunch(anchor, time, lunches),
    );
    if (tooClose !== undefined) {
      time = tooClose + options.minGap;
      continue;
    }
    return time;
  }
}

function separatedByLunch(a: number, b: number, lunches: readonly Zone[]): boolean {
  const from = Math.min(a, b);
  const to = Math.max(a, b);
  return lunches.some((lunch) => lunch.start >= from && lunch.end <= to);
}
