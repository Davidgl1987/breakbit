import { DAY_END_LEAD_MIN, PLANNER, SPACING } from '@/domain/config';
import { contentExerciseIds } from '@/domain/planner/pauseContent';
import { buildTimeline, overlaps, type Interval } from '@/domain/planner/timeline';
import { minutesOfDay } from '@/domain/time';
import type { Catalog, DayPlan, EquipmentId, ScheduledActivity } from '@/domain/types';

/** Exercises a pause asks the user to do (routines expanded). */
export function exerciseIdsOf(item: ScheduledActivity, catalog: Catalog): string[] {
  return contentExerciseIds(item.content, catalog);
}

/**
 * Hard rules every placed microbreak must satisfy. Returns human-readable violations
 * (empty when the plan is valid) so property tests can show what went wrong.
 */
export function microbreakViolations(
  plan: DayPlan,
  catalog: Catalog,
  options: { from: number; equipment: readonly EquipmentId[] },
): string[] {
  const issues: string[] = [];
  const timeline = buildTimeline(plan.schedule, plan.meetings);
  const exercises = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
  const main = plan.activities.find((item) => item.kind === 'main');
  const mainStart = main ? minutesOfDay(main.currentScheduledAt) : undefined;
  const mainZone: Interval | undefined =
    main && mainStart !== undefined
      ? {
          start: mainStart - PLANNER.mainPreBufferMin,
          end: mainStart + Math.ceil(main.durationSec / 60) + PLANNER.mainPostBufferMin,
        }
      : undefined;

  const placed = plan.activities
    .filter((item) => item.kind === 'micro' && item.status !== 'missed')
    .sort((a, b) => a.currentScheduledAt - b.currentScheduledAt);

  placed.forEach((item, index) => {
    const start = minutesOfDay(item.currentScheduledAt);
    const span: Interval = { start, end: start + Math.ceil(item.durationSec / 60) };
    const label = `${item.id}@${start}`;
    if (start < options.from) issues.push(`${label} before ${options.from}`);
    if (span.end > timeline.workEnd - DAY_END_LEAD_MIN) issues.push(`${label} too late`);
    if (timeline.lunch && overlaps(span, timeline.lunch)) issues.push(`${label} in lunch`);
    if (timeline.busyMeetings.some((meeting) => overlaps(span, meeting))) {
      issues.push(`${label} in busy meeting`);
    }
    if (mainZone && overlaps(span, mainZone)) issues.push(`${label} next to main activity`);
    const inMoveMeeting = timeline.moveMeetings.some(
      (meeting) => start >= meeting.start && start < meeting.end,
    );
    if (inMoveMeeting && item.slot !== 'meeting')
      issues.push(`${label} in a meeting as ${item.slot}`);

    const ids = exerciseIdsOf(item, catalog);
    if (ids.length === 0) issues.push(`${label} has no exercises`);
    for (const id of ids) {
      const exercise = exercises.get(id);
      if (!exercise) {
        issues.push(`${label} unknown exercise ${id}`);
        continue;
      }
      if (!exercise.equipment.every((tool) => options.equipment.includes(tool))) {
        issues.push(`${label} needs equipment for ${id}`);
      }
      if (exercise.posture === 'floor' && item.slot !== 'break') {
        issues.push(`${label} floor exercise ${id} outside a break`);
      }
      if (item.slot === 'meeting' && exercise.meetingFriendly === 'no') {
        issues.push(`${label} ${id} is not discreet enough for a meeting`);
      }
    }

    const previous = placed[index - 1];
    if (previous) {
      const previousStart = minutesOfDay(previous.currentScheduledAt);
      const lunchBetween =
        timeline.lunch !== undefined &&
        timeline.lunch.start >= previousStart &&
        timeline.lunch.end <= start;
      if (!lunchBetween && start - previousStart < SPACING.minGapAfterReplanMin) {
        issues.push(`${label} only ${start - previousStart} min after ${previous.id}`);
      }
    }
  });
  return issues;
}
