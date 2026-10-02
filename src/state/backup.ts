import type { AppEvent } from '@/domain/types';
import { clock } from '@/services/clock';
import { clearEvents, readEvents, replaceEvents } from '@/services/eventLog';
import { pickPersisted } from './initialState';
import { migrateState, STATE_VERSION } from './migrations';
import { useAppStore } from './store';
import type { PersistedState } from './types';
import { validateEvents, validatePersistedState } from './validatePersisted';

/**
 * Local data is all there is (no account, no server), so users can save it to a file
 * and bring it back — e.g. before Safari evicts a non-installed site's storage.
 */
export interface Backup {
  app: 'breakbit';
  version: number;
  exportedAt: number;
  state: PersistedState;
  events: AppEvent[];
}

/** A year of daily use is ~10k events; anything far beyond that is not a Breakbit backup. */
const MAX_EVENTS = 200_000;

export class BackupError extends Error {
  constructor(
    readonly code: 'invalid_format' | 'unsupported_version',
    /** Paths of the invalid fields, for debugging. */
    readonly issues: string[] = [],
  ) {
    super(`Backup ${code}${issues.length > 0 ? `: ${issues.slice(0, 5).join('; ')}` : ''}`);
    this.name = 'BackupError';
  }
}

export async function exportBackup(): Promise<Backup> {
  return {
    app: 'breakbit',
    version: STATE_VERSION,
    exportedAt: clock.now(),
    state: pickPersisted(useAppStore.getState()),
    events: await readEvents(),
  };
}

/** Validates, migrates and restores a backup, replacing all current data. */
export async function importBackup(raw: unknown): Promise<void> {
  const { state, events } = parseBackup(raw);
  useAppStore.getState().replaceData(state);
  await replaceEvents(events);
}

/** Deletes all data and the event log; appearance and language are kept. */
export async function resetAllData(): Promise<void> {
  useAppStore.getState().resetData();
  await clearEvents();
}

/**
 * Validates a backup file completely (structure, types, allowed values, coherent dates and
 * schedules, no prototype-polluting keys) and migrates it to the current version.
 * Nothing touches the store unless the whole file is valid.
 */
export function parseBackup(raw: unknown): { state: PersistedState; events: AppEvent[] } {
  if (!isPlainObject(raw) || raw.app !== 'breakbit') throw new BackupError('invalid_format');
  const version = raw.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new BackupError('invalid_format', ['version']);
  }
  if (version > STATE_VERSION) throw new BackupError('unsupported_version');
  if (!Array.isArray(raw.events) || raw.events.length > MAX_EVENTS) {
    throw new BackupError('invalid_format', ['events']);
  }

  let state: PersistedState;
  try {
    state = migrateState(raw.state, version, clock.now());
  } catch {
    throw new BackupError('invalid_format', ['state']);
  }
  const issues = [...validatePersistedState(state), ...validateEvents(raw.events)];
  if (issues.length > 0) throw new BackupError('invalid_format', issues);
  return { state, events: raw.events as AppEvent[] };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
