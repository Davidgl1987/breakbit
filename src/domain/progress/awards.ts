import { XP } from '../config';
import { toDateKey } from '../time';
import type { Instant, ScheduledActivity, XpEntry } from '../types';

/**
 * XP for a completed microbreak. Keys are deterministic, so recording the same
 * completion twice never counts twice.
 * - planned pause: +100 (×1.5 on the return day after an absence, base only);
 * - "a la primera": +20 more, never multiplied;
 * - recovered at the end of the day: the base +100, without the "a la primera" bonus.
 * Extras from "Tengo un hueco" have their own reward.
 */
export function pauseCompletionXp(
  item: ScheduledActivity,
  { returnBonus }: { returnBonus: boolean },
  now: Instant,
): XpEntry[] {
  if (item.kind !== 'micro' || item.status !== 'completed' || item.origin === 'gap') return [];
  const date = toDateKey(item.scheduledAt);
  const planned = item.origin === 'plan';
  const base = Math.round(XP.microbreak * (planned && returnBonus ? XP.returnMultiplier : 1));
  const entries: XpEntry[] = [
    { key: `micro:${item.id}`, amount: base, at: now, date, reason: 'microbreak' },
  ];
  if (planned && item.firstPrompt) {
    entries.push({
      key: `first:${item.id}`,
      amount: XP.firstPrompt,
      at: now,
      date,
      reason: 'first_prompt',
    });
  }
  return entries;
}

/** Adds entries whose key isn't in the ledger yet. */
export function withAwards(ledger: readonly XpEntry[], entries: readonly XpEntry[]): XpEntry[] {
  const keys = new Set(ledger.map((entry) => entry.key));
  const fresh = entries.filter((entry) => !keys.has(entry.key));
  return fresh.length === 0 ? [...ledger] : [...ledger, ...fresh];
}
