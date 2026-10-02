import type { Instant } from '@/domain/types';
import { localHints } from './storage';

/**
 * The app's single source of "now". In development it can be shifted (DevPanel time
 * travel) to walk through a whole workday; production always uses the real time.
 */
const OFFSET_HINT = 'dev-clock-offset';

let offsetMs = import.meta.env.DEV ? Number(localHints.get(OFFSET_HINT)) || 0 : 0;
const listeners = new Set<() => void>();

// Cached "now" for React: it only changes on a tick, never between two reads in one render.
let cached = Date.now() + offsetMs;
let refreshedAt = Date.now();
function refresh() {
  refreshedAt = Date.now();
  cached = refreshedAt + offsetMs;
}

export const clock = {
  now(): Instant {
    return Date.now() + offsetMs;
  },

  /** Dev only: how far the simulated time is from the real time. */
  offset(): number {
    return offsetMs;
  },

  /** Dev only: shift the simulated time (persisted across reloads). */
  setOffset(ms: number): void {
    if (!import.meta.env.DEV) return;
    offsetMs = Math.round(ms);
    localHints.set(OFFSET_HINT, String(offsetMs));
    notify();
  },

  /** Dev only: jump to an absolute instant. */
  travelTo(instant: Instant): void {
    clock.setOffset(instant - Date.now());
  },

  /**
   * Stable value for useSyncExternalStore: updated on every tick, or lazily when nothing
   * is ticking (reads within the same moment always agree).
   */
  snapshot(): Instant {
    if (timer === undefined && Date.now() - refreshedAt > 500) refresh();
    return cached;
  },

  /** Called on every tick and whenever the offset changes. */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (listeners.size === 1) startTicking();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) stopTicking();
    };
  },
};

// ---------- Ticking (only while something listens) ----------

const TICK_MS = 1000;
let timer: ReturnType<typeof setInterval> | undefined;

function notify() {
  refresh();
  listeners.forEach((listener) => listener());
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') notify();
}

function startTicking() {
  refresh();
  timer = setInterval(notify, TICK_MS);
  document.addEventListener('visibilitychange', onVisibilityChange);
}

function stopTicking() {
  clearInterval(timer);
  timer = undefined;
  document.removeEventListener('visibilitychange', onVisibilityChange);
}
