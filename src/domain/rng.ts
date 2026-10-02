/**
 * Deterministic pseudo-random numbers. Plans are seeded (date + reroll count) so they
 * stay stable across reloads and tests are reproducible.
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number;
}

/** mulberry32 seeded with a 32-bit FNV-1a hash of `seed`. */
export function createRng(seed: string): Rng {
  let state = hashString(seed);
  return {
    next() {
      state = (state + 0x6d2b79f5) | 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
    },
  };
}

/**
 * Picks an item with probability proportional to its weight.
 * Items with weight ≤ 0 are never picked. Returns undefined if nothing is pickable.
 */
export function weightedPick<T>(
  items: readonly T[],
  weightOf: (item: T) => number,
  rng: Rng,
): T | undefined {
  const weights = items.map((item) => Math.max(weightOf(item), 0));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let target = rng.next() * total;
  let lastPickable: T | undefined;
  items.forEach((item, index) => {
    const weight = weights[index] ?? 0;
    if (weight <= 0 || target < 0) return;
    lastPickable = item;
    target -= weight;
  });
  // The item where the running target dropped below zero; with floating-point
  // remainders, the last pickable item.
  return lastPickable;
}

function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
