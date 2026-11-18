import type { EventType } from '@/domain/types';

/**
 * Anonymous, cookieless usage counts sent to GoatCounter (https://www.goatcounter.com):
 * which screens are opened and a few milestones, never ids, times, settings or anything
 * typed. It only runs in production builds with VITE_GOATCOUNTER set (the site code, e.g.
 * `breakbit` for breakbit.goatcounter.com) and the user can turn it off in Settings.
 */
const SITE = import.meta.env.VITE_GOATCOUNTER as string | undefined;
const OPT_OUT_KEY = 'breakbit:analytics';
const LAST_ACTIVE_KEY = 'breakbit:analytics-active';
let optedOutThisVisit = false;

/** Local milestones worth counting; everything else in the event log stays on the device. */
const TRACKED_EVENTS: Partial<Record<EventType, string>> = {
  exercise_completed: 'pause-done',
  exercise_postponed: 'pause-postponed',
  exercise_skipped: 'pause-skipped',
  spontaneous_break: 'gap-break',
  main_activity_completed: 'main-done',
  day_completed: 'day-done',
  notification_opened: 'notification-opened',
};

export function analyticsAvailable(): boolean {
  return import.meta.env.PROD && Boolean(SITE);
}

export function analyticsEnabled(): boolean {
  if (!analyticsAvailable()) return false;
  try {
    return localStorage.getItem(OPT_OUT_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setAnalyticsEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.removeItem(OPT_OUT_KEY);
    else localStorage.setItem(OPT_OUT_KEY, 'off');
  } catch {
    // Private windows may refuse storage; the choice then lasts this visit only.
    optedOutThisVisit = !enabled;
  }
}

/** A screen was opened. Ids in the path (a pause, a week) are dropped. */
export function trackScreen(pathname: string): void {
  send({ p: screenPath(pathname), t: 'Breakbit' });
}

/** A named milestone, e.g. `landing-start` or `onboarding-done`. */
export function trackEvent(name: string): void {
  send({ p: name, e: 'true' });
}

/** Forwards an app event from the local log when it is one of the counted milestones. */
export function trackAppEvent(type: EventType): void {
  const name = TRACKED_EVENTS[type];
  if (name) trackEvent(name);
}

/**
 * Once a day, how long ago the user set Breakbit up (`active-d0`, `active-d1`, `active-w1`…):
 * enough to see whether people come back, without a user id.
 */
export function trackActiveDay(onboardedAt: number, now: number): void {
  const today = new Date(now).toDateString();
  try {
    if (localStorage.getItem(LAST_ACTIVE_KEY) === today) return;
    localStorage.setItem(LAST_ACTIVE_KEY, today);
  } catch {
    return;
  }
  trackEvent(`active-${retentionBucket(onboardedAt, now)}`);
  if (standalone()) trackEvent('active-installed');
}

export function retentionBucket(onboardedAt: number, now: number): string {
  const days = Math.floor((now - onboardedAt) / 86_400_000);
  if (days <= 0) return 'd0';
  if (days === 1) return 'd1';
  if (days < 7) return 'd2-6';
  if (days < 14) return 'w1';
  if (days < 28) return 'w2-3';
  if (days < 56) return 'm1';
  return 'm2+';
}

/** `/pause/abc/play` → `/pause/play`: the screen, not which pause. */
export function screenPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const [section, , ...rest] = parts;
  if (section === 'pause' || section === 'main' || section === 'week') {
    return `/${[section, ...rest].join('/')}`;
  }
  return `/${parts.join('/')}`;
}

let firstScreen = true;

function send(params: Record<string, string>): void {
  if (!analyticsEnabled() || optedOutThisVisit) return;
  const query = new URLSearchParams({ ...params, rnd: Math.random().toString(36).slice(2) });
  // Where the visit came from (a site, or `?ref=reddit` on a shared link), on its first screen.
  if (firstScreen && !params.e) {
    firstScreen = false;
    if (document.referrer) query.set('r', document.referrer);
    if (location.search) query.set('q', location.search);
  }
  const url = `https://${SITE}.goatcounter.com/count?${query}`;
  try {
    if (!navigator.sendBeacon?.(url)) {
      void fetch(url, { method: 'GET', mode: 'no-cors', keepalive: true }).catch(() => {});
    }
  } catch {
    // Counting must never break the app.
  }
}

function standalone(): boolean {
  try {
    return matchMedia('(display-mode: standalone)').matches;
  } catch {
    return false;
  }
}
