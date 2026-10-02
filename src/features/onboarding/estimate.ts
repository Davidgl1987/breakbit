import { CATALOG } from '@/content/catalog';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { summarizePlan } from '@/domain/planner/summary';
import type { DateKey, UserSettings } from '@/domain/types';

export interface DayEstimate {
  pauses: number;
  /** Rounded up to at least 1 minute when there is any interruption. */
  interruptionMin: number;
  mainMin: number;
}

/** What a typical day with these settings looks like, using the real planner. */
export function estimateDay(settings: UserSettings, date: DateKey): DayEstimate {
  const plan = generateDayPlan({ date, schedule: settings.schedule, settings, catalog: CATALOG });
  const summary = summarizePlan(plan, CATALOG);
  return {
    pauses: summary.microCount,
    interruptionMin:
      summary.interruptionSec > 0 ? Math.max(1, Math.round(summary.interruptionSec / 60)) : 0,
    mainMin: summary.main ? Math.round(summary.main.durationSec / 60) : 0,
  };
}
