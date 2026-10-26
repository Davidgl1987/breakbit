import { mainDonePath, mainPath, pausePath, ROUTES } from '@/app/routes';
import type { PlannedNotification } from '@/domain/notifications/schedule';
import { windowEnd } from '@/domain/pause/window';
import { atTime } from '@/domain/time';
import { contentName } from '@/features/day/contentName';
import {
  formatClock,
  formatDuration,
  formatSeconds,
  translate,
  type MessageKey,
  type MessageParams,
} from '@/i18n/translate';
import type { NotificationContent } from '@/services/notifications/scheduler';
import { selectActivity } from '@/state/selectors';
import type { AppState } from '@/state/store';

const APP_ICON = `${import.meta.env.BASE_URL}app-icons/icon-192.png`;

/** Localised text and link for a planned notification, from the current state. */
export function notificationContent(
  notification: PlannedNotification,
  state: AppState,
): NotificationContent | undefined {
  const t = (key: MessageKey, params?: MessageParams) => translate(state.prefs.locale, key, params);

  if (notification.kind === 'day_end') {
    return {
      title: t('notifications.dayEnd.title'),
      body: t('notifications.dayEnd.body'),
      url: `${ROUTES.dayEnd}?src=notif`,
      icon: APP_ICON,
    };
  }
  if (notification.kind === 'day_start') {
    return {
      title: t('notifications.dayStart.title'),
      body: t('notifications.dayStart.body'),
      url: `${ROUTES.dayStart}?src=notif`,
      icon: APP_ICON,
    };
  }
  if (notification.kind === 'break') {
    return {
      title: t('notifications.break.title'),
      body: t('notifications.break.body', {
        time: notification.until === undefined ? '' : formatClock(notification.until),
      }),
      url: ROUTES.today,
      icon: APP_ICON,
    };
  }

  const activity = notification.activityId
    ? selectActivity(notification.activityId)(state)
    : undefined;
  if (!activity) return undefined;
  const name = contentName(activity.content, state.prefs.locale);
  if (notification.kind === 'main') {
    // In a break that starts with it: the break's notice is this one.
    const breakStarts = (state.days[notification.date]?.plan?.schedule.breaks ?? []).some(
      (block) => atTime(notification.date, block.start) === activity.currentScheduledAt,
    );
    const key = breakStarts ? 'notifications.mainBreak' : 'notifications.main';
    return {
      title: t(`${key}.title`),
      body: t(`${key}.body`, {
        name,
        duration: formatDuration(activity.durationSec / 60),
      }),
      url: `${mainPath(activity.id)}?src=notif`,
      icon: APP_ICON,
    };
  }
  if (notification.kind === 'main_done') {
    const xp = state.xpLedger.find((entry) => entry.key === `main:${notification.date}`);
    return {
      title: t('notifications.mainDone.title'),
      body: t('notifications.mainDone.body', { name, xp: xp?.amount ?? 0 }),
      url: `${mainDonePath(activity.id)}?src=notif`,
      icon: APP_ICON,
    };
  }
  const url = `${pausePath(activity.id)}?src=notif`;
  // A pause is easy to miss while looking elsewhere: it stays until answered.
  if (notification.kind === 'pause') {
    return {
      title: t('notifications.pause.title'),
      body: t('notifications.pause.body', { name, duration: formatSeconds(activity.durationSec) }),
      url,
      icon: APP_ICON,
      requireInteraction: true,
    };
  }
  const minutesLeft = Math.ceil((windowEnd(activity) - notification.at) / 60_000);
  return {
    title: t('notifications.reminder.title'),
    body: t('notifications.reminder.body', { name, minutes: minutesLeft }),
    url,
    icon: APP_ICON,
    requireInteraction: true,
  };
}
