import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { createRng, weightedPick } from './rng';

describe('createRng', () => {
  it('is deterministic per seed', () => {
    const a = createRng('2026-10-02#0');
    const b = createRng('2026-10-02#0');
    const c = createRng('2026-10-02#1');
    const seqA = [a.next(), a.next(), a.next()];
    expect([b.next(), b.next(), b.next()]).toEqual(seqA);
    expect(c.next()).not.toBe(seqA[0]);
  });

  it('returns floats in [0, 1)', () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        const rng = createRng(seed);
        for (let i = 0; i < 20; i++) {
          const value = rng.next();
          if (value < 0 || value >= 1) return false;
        }
        return true;
      }),
    );
  });
});

describe('weightedPick', () => {
  it('never picks zero-weight items', () => {
    const rng = createRng('zero');
    for (let i = 0; i < 200; i++) {
      expect(weightedPick(['a', 'b', 'c'], (item) => (item === 'b' ? 0 : 1), rng)).not.toBe('b');
    }
  });

  it('returns undefined when nothing is pickable', () => {
    expect(weightedPick([], () => 1, createRng('x'))).toBeUndefined();
    expect(weightedPick(['a'], () => 0, createRng('x'))).toBeUndefined();
  });

  it('follows the weights over many draws', () => {
    const rng = createRng('distribution');
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 10_000; i++) {
      const item = weightedPick(['a', 'b'] as const, (key) => (key === 'a' ? 3 : 1), rng);
      if (item) counts[item]++;
    }
    expect(counts.a / 10_000).toBeGreaterThan(0.72);
    expect(counts.a / 10_000).toBeLessThan(0.78);
  });
});
