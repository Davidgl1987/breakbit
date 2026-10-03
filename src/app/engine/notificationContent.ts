import { mainDonePath, mainPath, pausePath, ROUTES } from '@/app/routes';
import type { PlannedNotification } from '@/domain/notifications/schedule';
import { windowEnd } from '@/domain/pause/window';
import { contentName } from '@/features/day/contentName';
import {
  formatDuration,
  formatSeconds,
  translate,
  type MessageKey,
  type MessageParams,
} from '@/i18n/translate';
import type { NotificationContent } from '@/services/notifications/scheduler';
import { selectActivity } from '@/state/selectors';
import type { AppState } from '@/state/store';

const ICONS = {
  pause: '/icons/48/stretch.png',
  day: '/icons/48/sun.png',
  main: '/icons/48/goal.png',
} as const;

/** Localised text and link for a planned notification, from the current state. */
export function notificationContent(
  notification: PlannedNotification,
  state: AppState,
): NotificationContent | undefined {
  const t = (key: MessageKey, params?: MessageParams) => translate(state.prefs.locale, key, params);

  if (notification.kind === 'day_start') {
    return {
      title: t('notifications.dayStart.title'),
      body: t('notifications.dayStart.body'),
      url: `${ROUTES.dayStart}?src=notif`,
      icon: ICONS.day,
    };
  }

  const activity = notification.activityId
    ? selectActivity(notification.activityId)(state)
    : undefined;
  if (!activity) return undefined;
  const name = contentName(activity.content, state.prefs.locale);
  if (notification.kind === 'main') {
    return {
      title: t('notifications.main.title'),
      body: t('notifications.main.body', {
        name,
        duration: formatDuration(activity.durationSec / 60),
      }),
      url: `${mainPath(activity.id)}?src=notif`,
      icon: ICONS.main,
    };
  }
  if (notification.kind === 'main_done') {
    const xp = state.xpLedger.find((entry) => entry.key === `main:${notification.date}`);
    return {
      title: t('notifications.mainDone.title'),
      body: t('notifications.mainDone.body', { name, xp: xp?.amount ?? 0 }),
      url: `${mainDonePath(activity.id)}?src=notif`,
      icon: ICONS.main,
    };
  }
  const url = `${pausePath(activity.id)}?src=notif`;
  if (notification.kind === 'pause') {
    return {
      title: t('notifications.pause.title'),
      body: t('notifications.pause.body', { name, duration: formatSeconds(activity.durationSec) }),
      url,
      icon: ICONS.pause,
    };
  }
  const minutesLeft = Math.ceil((windowEnd(activity) - notification.at) / 60_000);
  return {
    title: t('notifications.reminder.title'),
    body: t('notifications.reminder.body', { name, minutes: minutesLeft }),
    url,
    icon: ICONS.pause,
  };
}
