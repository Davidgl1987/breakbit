import { atTime } from '@/domain/time';
import type { DayPlan, Instant, ScheduledActivity } from '@/domain/types';

export type TimelineItem =
  | { kind: 'workStart' | 'workEnd'; at: Instant }
  | { kind: 'break' | 'lunch'; at: Instant; end: Instant }
  | { kind: 'meeting'; at: Instant; end: Instant; canMove: boolean }
  | { kind: 'pause' | 'main'; at: Instant; activity: ScheduledActivity };

/** Order for things at the same minute: the day opens first and closes last. */
const RANK: Record<TimelineItem['kind'], number> = {
  workStart: 0,
  break: 1,
  lunch: 1,
  meeting: 2,
  main: 3,
  pause: 4,
  workEnd: 5,
};

/** Everything in the day, in time order: hours, breaks, meetings, pauses and the activity. */
export function timelineItems(plan: DayPlan): TimelineItem[] {
  const { date, schedule } = plan;
  const block = (start: `${number}:${number}`, durationMin: number) => {
    const at = atTime(date, start);
    return { at, end: at + durationMin * 60_000 };
  };
  const items: TimelineItem[] = [
    { kind: 'workStart', at: atTime(date, schedule.workStart) },
    { kind: 'workEnd', at: atTime(date, schedule.workEnd) },
    ...schedule.breaks.map((item) => ({
      kind: 'break' as const,
      ...block(item.start, item.durationMin),
    })),
    ...(schedule.lunch
      ? [{ kind: 'lunch' as const, ...block(schedule.lunch.start, schedule.lunch.durationMin) }]
      : []),
    ...plan.meetings.map((meeting) => ({
      kind: 'meeting' as const,
      at: atTime(date, meeting.start),
      end: atTime(date, meeting.end),
      canMove: meeting.canMove,
    })),
    ...plan.activities.map((activity) => ({
      kind: activity.kind === 'main' ? ('main' as const) : ('pause' as const),
      at: activity.currentScheduledAt,
      activity,
    })),
  ];
  return items.sort((a, b) => a.at - b.at || RANK[a.kind] - RANK[b.kind]);
}
