import type { StoreApi } from 'zustand';
import { CATALOG } from '@/content/catalog';
import { advanceDay } from '@/domain/pause/advance';
import * as lifecycle from '@/domain/pause/lifecycle';
import type { ContentContext } from '@/domain/planner/pauseContent';
import { rebalance } from '@/domain/planner/rebalance';
import { compareDateKeys, toDateKey } from '@/domain/time';
import type {
  DateKey,
  DayPlan,
  DayRecord,
  EventType,
  Instant,
  ScheduledActivity,
  UserSettings,
} from '@/domain/types';
import { clock } from '@/services/clock';
import { logEvent, type EventDetails } from '@/services/eventLog';
import type { AppState, PauseActions } from '../types';

/** The engine and the user's answers to a microbreak. The rules live in domain/pause. */
export function pauseActions(
  set: StoreApi<AppState>['setState'],
  get: StoreApi<AppState>['getState'],
): PauseActions {
  /** Applies `change` to one activity of a day under way; returns the updated activity. */
  const updateActivity = (
    date: DateKey,
    id: string,
    change: (item: ScheduledActivity, plan: DayPlan, now: Instant) => DayPlan | ScheduledActivity,
  ): ScheduledActivity | undefined => {
    const now = clock.now();
    const record = get().days[date];
    const item = record?.plan?.activities.find((activity) => activity.id === id);
    if (record?.status !== 'active' || !record.plan || !item) return undefined;
    const result = change(item, record.plan, now);
    if (result === item || result === record.plan) return undefined;
    const plan =
      'activities' in result
        ? result
        : {
            ...record.plan,
            activities: record.plan.activities.map((activity) =>
              activity.id === id ? result : activity,
            ),
          };
    set((state) => ({ days: { ...state.days, [date]: { ...record, plan } } }));
    return plan.activities.find((activity) => activity.id === id);
  };

  return {
    reconcile: (now) => {
      const { days, settings } = get();
      const today = toDateKey(now);
      const changed: Partial<Record<DateKey, DayRecord>> = {};
      for (const record of Object.values(days)) {
        if (!record?.plan || record.status !== 'active') continue;
        if (compareDateKeys(record.date, today) > 0) continue;
        const { plan, events } = advanceDay(record.plan, now, contentContext(settings));
        if (plan === record.plan) continue;
        changed[record.date] = { ...record, plan };
        for (const event of events) {
          log(event.type, { activityId: event.activityId, at: event.at });
        }
      }
      if (Object.keys(changed).length > 0)
        set((state) => ({ days: { ...state.days, ...changed } }));
    },

    notificationOpened: (date, id) => {
      const updated = updateActivity(date, id, (item, _plan, now) =>
        lifecycle.markNotificationOpened(item, now),
      );
      if (updated) log('notification_opened', { activityId: id });
    },

    postponePause: (date, id, minutes) => {
      const updated = updateActivity(date, id, (item, plan, now) => {
        const postponed = lifecycle.postpone(item, minutes, now);
        if (postponed === item) return plan;
        const withPostpone = {
          ...plan,
          activities: plan.activities.map((activity) =>
            activity.id === id ? postponed : activity,
          ),
        };
        // Pauses that now come too close afterwards move later.
        return rebalance(withPostpone, now, contentContext(get().settings));
      });
      if (updated) log('exercise_postponed', { activityId: id, data: { minutes } });
    },

    startPause: (date, id) => {
      const updated = updateActivity(date, id, (item, _plan, now) => lifecycle.start(item, now));
      if (updated) log('exercise_started', { activityId: id });
    },

    discardPause: (date, id, reason) => {
      const updated = updateActivity(date, id, (item) => lifecycle.discard(item, reason));
      if (!updated) return;
      const penalty = lifecycle.discardPenalty(updated, clock.now());
      set((state) =>
        state.xpLedger.some((entry) => entry.key === penalty.key)
          ? {}
          : { xpLedger: [...state.xpLedger, penalty] },
      );
      log('exercise_skipped', { activityId: id, data: reason ? { reason } : undefined });
    },
  };
}

function contentContext(settings: UserSettings): ContentContext {
  return { catalog: CATALOG, discomfort: settings.discomfort, equipment: settings.equipment };
}

/** Dogfooding events are best effort: a storage error never blocks the user. */
function log(type: EventType, details: EventDetails) {
  void logEvent(type, details).catch(() => {});
}
