import type { StoreApi } from 'zustand';
import { CATALOG } from '@/content/catalog';
import type { ContentContext } from '@/domain/planner/pauseContent';
import type {
  DateKey,
  DayPlan,
  EventType,
  Instant,
  ScheduledActivity,
  UserSettings,
} from '@/domain/types';
import { clock } from '@/services/clock';
import { logEvent, type EventDetails } from '@/services/eventLog';
import type { AppState } from '../types';

export type ActivityChange = (
  item: ScheduledActivity,
  plan: DayPlan,
  now: Instant,
) => DayPlan | ScheduledActivity;

/**
 * Applies `change` to one activity of a day under way, which may return the activity or
 * a whole new plan (when other pauses move too). Returns the updated activity, or
 * undefined when nothing changed.
 */
export function activityUpdater(
  set: StoreApi<AppState>['setState'],
  get: StoreApi<AppState>['getState'],
) {
  return (date: DateKey, id: string, change: ActivityChange): ScheduledActivity | undefined => {
    const now = clock.now();
    const record = get().days[date];
    const item = record?.plan?.activities.find((activity) => activity.id === id);
    if (record?.status !== 'active' || !record.plan || !item) return undefined;
    const result = change(item, record.plan, now);
    if (result === item || result === record.plan) return undefined;
    const plan = 'activities' in result ? result : withActivity(record.plan, result);
    set((state) => ({ days: { ...state.days, [date]: { ...record, plan } } }));
    return plan.activities.find((activity) => activity.id === id);
  };
}

/** The plan with one activity replaced. */
export function withActivity(plan: DayPlan, updated: ScheduledActivity): DayPlan {
  return {
    ...plan,
    activities: plan.activities.map((activity) =>
      activity.id === updated.id ? updated : activity,
    ),
  };
}

export function contentContext(settings: UserSettings): ContentContext {
  return { catalog: CATALOG, discomfort: settings.discomfort, equipment: settings.equipment };
}

/** Dogfooding events are best effort: a storage error never blocks the user. */
export function log(type: EventType, details: EventDetails) {
  void logEvent(type, details).catch(() => {});
}
