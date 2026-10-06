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
  /**
   * Stays on screen until the user acts on it, where the browser supports it. Closed by the
   * app once it is no longer due (answered, started, missed).
   */
  requireInteraction?: boolean;
}

interface LocalSchedulerOptions {
  /** Localised text and link for a notification. */
  render: (notification: PlannedNotification) => NotificationContent | undefined;
  /** Fallback click handler when there is no service worker. */
  onOpen: (url: string) => void;
  /**
   * Once per notification as it comes due, shown or not (the app may be in front, or
   * without permission); never for stale ones. The app plays its pause sound here.
   */
  onDue?: (notification: PlannedNotification) => void;
}

const DELIVERED_HINT = 'notified';
const MAX_REMEMBERED = 200;
/** After a sleep or a long time closed, old reminders are dropped instead of piling up. */
const STALE_MS = 5 * 60_000;

/**
 * Shows each due notification once (ids are remembered across reloads and shared by open
 * tabs). Nothing is shown while the app is in front: the in-app banner covers it.
 */
export function createLocalScheduler({
  render,
  onOpen,
  onDue,
}: LocalSchedulerOptions): NotificationScheduler {
  const delivered = new Set(readDelivered());
  // Shown without a service worker and kept on screen: closed here once answered.
  const persistent = new Map<string, Notification>();

  return {
    sync(planned, now) {
      // Another tab may have delivered some already.
      for (const id of readDelivered()) delivered.add(id);
      const fresh = planned.filter(
        (notification) => notification.at <= now && !delivered.has(notification.id),
      );
      if (fresh.length > 0) {
        for (const notification of fresh) delivered.add(notification.id);
        saveDelivered([...delivered]);
      }
      for (const notification of fresh) {
        if (now - notification.at > STALE_MS) continue;
        onDue?.(notification);
        if (appInFront()) continue;
        const content = render(notification);
        if (content) void show(notification, content, onOpen, persistent);
      }
      const dueTags = new Set(planned.filter((item) => item.at <= now).map((item) => item.tag));
      void closeAnswered(dueTags, persistent);
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
  persistent: Map<string, Notification>,
): Promise<void> {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const options = {
    body: content.body,
    tag: notification.tag,
    icon: content.icon,
    data: { url: content.url },
    // A reminder replaces the previous notification but still alerts.
    renotify: true,
    // Ignored where unsupported.
    requireInteraction: content.requireInteraction ?? false,
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
    if (content.requireInteraction) persistent.set(notification.tag, shown);
  } catch {
    // Some browsers refuse notifications in certain states; the in-app banner remains.
  }
}

/**
 * A notification that stays on screen goes once its reminder is no longer due: the pause
 * was answered in the app, started or missed. The others fade on their own, as before.
 */
async function closeAnswered(
  dueTags: ReadonlySet<string>,
  persistent: Map<string, Notification>,
): Promise<void> {
  for (const [tag, shown] of persistent) {
    if (dueTags.has(tag)) continue;
    shown.close();
    persistent.delete(tag);
  }
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    for (const shown of (await registration?.getNotifications()) ?? []) {
      if (shown.requireInteraction && !dueTags.has(shown.tag)) shown.close();
    }
  } catch {
    // Nothing to tidy up where notifications can't be listed.
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
