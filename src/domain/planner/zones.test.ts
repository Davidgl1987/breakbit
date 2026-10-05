import { describe, expect, it } from 'vitest';
import { makeSchedule } from '@/test/builders';
import { PLANNER } from '../config';
import { buildTimeline } from './timeline';
import { microbreakZones } from './zones';

const timeline = buildTimeline(makeSchedule({ breaks: [], lunch: undefined }));
const mainZone = (whileWorking?: boolean) =>
  microbreakZones(timeline, { start: 600, end: 630, whileWorking }).find(
    (zone) => zone.kind === 'main',
  );

describe('microbreakZones', () => {
  it('keeps pauses away from a main activity that stops work', () => {
    expect(mainZone(false)).toMatchObject({
      start: 600 - PLANNER.mainPreBufferMin,
      end: 630 + PLANNER.mainPostBufferMin,
    });
  });

  it("doesn't block the day around one done while working (standing desk, walking meeting)", () => {
    expect(mainZone(true)).toMatchObject({ start: 600, end: 630 });
  });
});
