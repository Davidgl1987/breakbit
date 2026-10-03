import type { PlannedNotification } from '@/domain/notifications/schedule';
import type { Instant } from '@/domain/types';
import { localHints } from '../storage';

/**
 * Delivery port for reminders. The engine hands over the day's agenda on every tick;
 * a channel decides what to show. MVP: local notifications while the app is open or in
 * the background. A Web Push channel can replace it later without touching the domain.
 */
export interface NotificationScheduler {
  sync(planned: readonly PlannedNotification[], now: Instant): void;
}

export interface NotificationContent {
  title: string;
  body: string;
  /** Where a click takes the user. */
  url: string;
  icon: string;
}

interface LocalSchedulerOptions {
  /** Localised text and link for a notification. */
  render: (notification: PlannedNotification) => NotificationContent | undefined;
  /** Fallback click handler when there is no service worker. */
  onOpen: (url: string) => void;
}

const DELIVERED_HINT = 'notified';
const MAX_REMEMBERED = 200;
/** After a sleep or a long time closed, old reminders are dropped instead of piling up. */
const STALE_MS = 5 * 60_000;

/**
 * Shows each due notification once (ids are remembered across reloads). Nothing is shown
 * while the app is in front: the in-app banner covers it.
 */
export function createLocalScheduler({
  render,
  onOpen,
}: LocalSchedulerOptions): NotificationScheduler {
  const delivered = new Set(readDelivered());

  return {
    sync(planned, now) {
      let changed = false;
      for (const notification of planned) {
        if (notification.at > now || delivered.has(notification.id)) continue;
        delivered.add(notification.id);
        changed = true;
        if (now - notification.at > STALE_MS || appInFront()) continue;
        const content = render(notification);
        if (content) void show(notification, content, onOpen);
      }
      if (changed) saveDelivered([...delivered]);
    },
  };
}

function appInFront(): boolean {
  return document.visibilityState === 'visible' && document.hasFocus();
}

async function show(
  notification: PlannedNotification,
  content: NotificationContent,
  onOpen: (url: string) => void,
): Promise<void> {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const options = {
    body: content.body,
    tag: notification.tag,
    icon: content.icon,
    data: { url: content.url },
    // A reminder replaces the previous notification but still alerts.
    renotify: true,
  } as NotificationOptions;
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(content.title, options);
      return;
    }
    const shown = new Notification(content.title, options);
    shown.onclick = () => {
      window.focus();
      onOpen(content.url);
      shown.close();
    };
  } catch {
    // Some browsers refuse notifications in certain states; the in-app banner remains.
  }
}

function readDelivered(): string[] {
  try {
    const parsed: unknown = JSON.parse(localHints.get(DELIVERED_HINT) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveDelivered(ids: string[]): void {
  localHints.set(DELIVERED_HINT, JSON.stringify(ids.slice(-MAX_REMEMBERED)));
}
