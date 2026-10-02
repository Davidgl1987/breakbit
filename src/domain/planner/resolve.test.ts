import { describe, expect, it } from 'vitest';
import { resolvePauseTimes, type ResolveOptions, type Zone } from './resolve';

const at = (h: number, m = 0) => h * 60 + m;
const lunch: Zone = { start: at(14), end: at(15), kind: 'lunch' };
const base: ResolveOptions = {
  anchors: [],
  zones: [lunch],
  minGap: 35,
  earliest: at(9),
  latestEnd: at(16, 50),
};
const pause = (
  desired: number,
  extra: Partial<{ durationMin: number; allowMoveMeetings: boolean }> = {},
) => ({
  desired,
  durationMin: 1,
  allowMoveMeetings: false,
  ...extra,
});

describe('resolvePauseTimes', () => {
  it('keeps pauses that break no rule', () => {
    expect(resolvePauseTimes([pause(at(10)), pause(at(11))], base)).toEqual([at(10), at(11)]);
  });

  it('pushes a pause out of lunch and busy meetings', () => {
    const meeting: Zone = { start: at(10), end: at(11), kind: 'busy_meeting' };
    expect(
      resolvePauseTimes([pause(at(10, 30)), pause(at(14, 20))], {
        ...base,
        zones: [lunch, meeting],
      }),
    ).toEqual([at(11), at(15)]);
  });

  it('does not let a pause run into a zone', () => {
    expect(resolvePauseTimes([pause(at(13, 58), { durationMin: 3 })], base)).toEqual([at(15)]);
  });

  it('keeps the minimum gap from anchors and earlier pauses, cascading', () => {
    expect(
      resolvePauseTimes([pause(at(10, 50)), pause(at(11, 20))], { ...base, anchors: [at(10, 30)] }),
    ).toEqual([at(11, 5), at(11, 40)]);
  });

  it('jumps past an anchor that is just ahead', () => {
    expect(resolvePauseTimes([pause(at(10))], { ...base, anchors: [at(10, 20)] })).toEqual([
      at(10, 55),
    ]);
  });

  it('does not require spacing across lunch', () => {
    expect(resolvePauseTimes([pause(at(15))], { ...base, anchors: [at(13, 50)] })).toEqual([
      at(15),
    ]);
  });

  it('lets only discreet pauses stay in movable meetings', () => {
    const meeting: Zone = { start: at(10), end: at(10, 30), kind: 'move_meeting' };
    const options = { ...base, zones: [meeting] };
    expect(resolvePauseTimes([pause(at(10), { allowMoveMeetings: true })], options)).toEqual([
      at(10),
    ]);
    expect(resolvePauseTimes([pause(at(10))], options)).toEqual([at(10, 30)]);
  });

  it('never moves a pause earlier', () => {
    expect(resolvePauseTimes([pause(at(8))], base)).toEqual([at(9)]);
  });

  it('drops pauses that no longer fit before the end of the day', () => {
    expect(resolvePauseTimes([pause(at(16, 30)), pause(at(16, 45))], base)).toEqual([
      at(16, 30),
      null,
    ]);
  });
});
