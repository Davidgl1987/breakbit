import fc from 'fast-check';
import { validateSchedule } from '@/domain/calendar/validation';
import { fromMinutes } from '@/domain/time';
import {
  BODY_AREAS,
  EQUIPMENT,
  type BodyArea,
  type DaySchedule,
  type DiscomfortLevel,
  type DiscomfortLevels,
  type Intensity,
  type Meeting,
} from '@/domain/types';

const quarter = (minutes: number) => Math.round(minutes / 15) * 15;

/**
 * Valid daytime schedules: 4–10 h starting 06:00–11:00, an optional lunch around the
 * middle and up to two breaks (morning and afternoon), so most days have some.
 */
export const scheduleArb: fc.Arbitrary<DaySchedule> = fc
  .record({
    start: fc.integer({ min: 24, max: 44 }).map((q) => q * 15),
    length: fc.integer({ min: 16, max: 40 }).map((q) => q * 15),
    lunch: fc.option(
      fc.record({
        at: fc.double({ min: 0.35, max: 0.65, noNaN: true }),
        duration: fc.constantFrom(30, 45, 60, 90),
      }),
      { nil: undefined },
    ),
    morningBreak: fc.option(
      fc.record({
        at: fc.double({ min: 0, max: 0.25, noNaN: true }),
        duration: fc.constantFrom(10, 15, 20, 30),
      }),
      { nil: undefined },
    ),
    afternoonBreak: fc.option(
      fc.record({
        at: fc.double({ min: 0.75, max: 1, noNaN: true }),
        duration: fc.constantFrom(10, 15, 20, 30),
      }),
      { nil: undefined },
    ),
  })
  .map(({ start, length, lunch, morningBreak, afternoonBreak }) => {
    const block = (spot: { at: number; duration: number }) => ({
      start: fromMinutes(quarter(start + 30 + spot.at * (length - 60 - spot.duration))),
      durationMin: spot.duration,
    });
    return {
      workStart: fromMinutes(start),
      workEnd: fromMinutes(start + length),
      lunch: lunch ? block(lunch) : undefined,
      breaks: [morningBreak, afternoonBreak].flatMap((spot) => (spot ? [block(spot)] : [])),
    };
  })
  .filter((schedule) => validateSchedule(schedule).length === 0);

export function meetingsArb(schedule: DaySchedule): fc.Arbitrary<Meeting[]> {
  const [startH = 0, startM = 0] = schedule.workStart.split(':').map(Number);
  const [endH = 0, endM = 0] = schedule.workEnd.split(':').map(Number);
  const start = startH * 60 + startM;
  const length = endH * 60 + endM - start;
  return fc
    .array(
      fc
        .record({
          at: fc.double({ min: 0, max: 1, noNaN: true }),
          duration: fc.constantFrom(30, 45, 60, 90),
          canMove: fc.boolean(),
        })
        .map(({ at, duration, canMove }) => {
          const meetingStart = quarter(start + at * Math.max(length - duration, 0));
          return {
            start: fromMinutes(meetingStart),
            end: fromMinutes(Math.min(meetingStart + duration, start + length)),
            canMove,
          };
        }),
      { maxLength: 3 },
    )
    .map((items) => items.map((item, index) => ({ id: `m${index}`, ...item })));
}

export const discomfortArb: fc.Arbitrary<DiscomfortLevels> = fc.record(
  Object.fromEntries(BODY_AREAS.map((area) => [area, fc.integer({ min: 0, max: 5 })])) as Record<
    BodyArea,
    fc.Arbitrary<DiscomfortLevel>
  >,
);

export const intensityArb: fc.Arbitrary<Intensity> = fc.constantFrom('soft', 'normal', 'active');

export const equipmentArb = fc.subarray([...EQUIPMENT]);
