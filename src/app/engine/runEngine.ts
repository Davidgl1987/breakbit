import { resolveDaySchedule } from '@/domain/calendar/schedule';
import { buildNotificationSchedule } from '@/domain/notifications/schedule';
import { isDue } from '@/domain/pause/window';
import { toDateKey } from '@/domain/time';
import type { Instant } from '@/domain/types';
import { translate } from '@/i18n/translate';
import type { NotificationScheduler } from '@/services/notifications/scheduler';
import { useAppStore } from '@/state/store';

const BASE_TITLE = 'Breakbit';

/**
 * One engine tick: moves the days under way forward to `now`, hands today's reminders to
 * the delivery channel and flags a due pause in the tab title.
 */
export function runEngine(now: Instant, scheduler: NotificationScheduler): void {
  useAppStore.getState().reconcile(now);
  // Yesterday (or longer ago) left open, or workdays nobody started: settled now.
  useAppStore.getState().closePastDays(now);
  const state = useAppStore.getState();
  const date = toDateKey(now);
  const record = state.days[date];
  const dayOff = state.dayOverrides[date]?.working === false || record?.status === 'day_off';

  scheduler.sync(
    buildNotificationSchedule({
      date,
      record,
      schedule: resolveDaySchedule(date, state.settings, state.dayOverrides),
      dayOff,
      prefs: state.settings.notifications,
    }),
    now,
  );

  const due =
    record?.status === 'active' && record.plan?.activities.some((item) => isDue(item, now));
  document.title = due
    ? `${translate(state.prefs.locale, 'notifications.tabTitle')} · ${BASE_TITLE}`
    : BASE_TITLE;
}
