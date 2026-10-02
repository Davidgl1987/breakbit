import { clear, createStore, setMany, set, values } from 'idb-keyval';
import { toDateKey } from '@/domain/time';
import type { AppEvent, EventType, Instant } from '@/domain/types';
import { clock } from './clock';

/**
 * Local dogfooding log (master §25). One key per event so appending never rewrites the
 * whole history; only read for export or debugging.
 */
const eventStore = createStore('breakbit-events', 'events');

export interface EventDetails {
  activityId?: string;
  data?: AppEvent['data'];
  /** Defaults to now; the day defaults to the day of `at`. */
  at?: Instant;
}

export async function logEvent(type: EventType, details: EventDetails = {}): Promise<AppEvent> {
  const at = details.at ?? clock.now();
  const event: AppEvent = {
    id: `${at.toString(36).padStart(9, '0')}-${randomSuffix()}`,
    type,
    at,
    date: toDateKey(at),
    ...(details.activityId !== undefined && { activityId: details.activityId }),
    ...(details.data !== undefined && { data: details.data }),
  };
  await set(event.id, event, eventStore);
  return event;
}

/**
 * 8 random hex chars. getRandomValues also works over plain http (e.g. testing from a
 * phone on the local network), unlike randomUUID, which needs a secure context.
 */
function randomSuffix(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** All events, oldest first. */
export async function readEvents(): Promise<AppEvent[]> {
  const events = await values<AppEvent>(eventStore);
  return events.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
}

export async function replaceEvents(events: readonly AppEvent[]): Promise<void> {
  await clear(eventStore);
  await setMany(
    events.map((event) => [event.id, event]),
    eventStore,
  );
}

export async function clearEvents(): Promise<void> {
  await clear(eventStore);
}
