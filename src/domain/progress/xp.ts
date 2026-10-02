import { LEVEL } from '../config';
import type { XpEntry } from '../types';

/**
 * Total XP from the ledger, applied in order with a floor at 0: a penalty can't take the
 * total below zero (and the next award starts from there).
 */
export function totalXp(entries: readonly XpEntry[]): number {
  return [...entries]
    .sort((a, b) => a.at - b.at || a.key.localeCompare(b.key))
    .reduce((total, entry) => Math.max(0, total + entry.amount), 0);
}

export interface LevelProgress {
  level: number;
  /** XP earned inside the current level. */
  current: number;
  /** XP needed to reach the next level. */
  needed: number;
}

/** Level from total XP with the (provisional) flat curve in config. Not tied to evolution. */
export function levelFromXp(total: number): LevelProgress {
  const safe = Math.max(0, Math.floor(total));
  return {
    level: Math.floor(safe / LEVEL.xpPerLevel) + 1,
    current: safe % LEVEL.xpPerLevel,
    needed: LEVEL.xpPerLevel,
  };
}
