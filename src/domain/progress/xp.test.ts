import { describe, expect, it } from 'vitest';
import type { XpEntry } from '../types';
import { levelFromXp, totalXp } from './xp';

const entry = (key: string, amount: number, at: number): XpEntry => ({
  key,
  amount,
  at,
  date: '2026-10-05',
  reason: amount < 0 ? 'discard' : 'microbreak',
});

describe('totalXp', () => {
  it('adds the ledger', () => {
    expect(totalXp([entry('a', 100, 1), entry('b', 20, 2), entry('c', 300, 3)])).toBe(420);
  });

  it('orders entries logged at the same moment by key', () => {
    expect(totalXp([entry('b', 100, 1), entry('a', -50, 1)])).toBe(100);
  });

  it('never goes below zero, applying entries in time order', () => {
    expect(totalXp([entry('b', 100, 2), entry('a', -50, 1)])).toBe(100);
    expect(totalXp([entry('a', 100, 1), entry('b', -50, 2)])).toBe(50);
    expect(totalXp([])).toBe(0);
  });
});

describe('levelFromXp', () => {
  it('uses 1000 XP per level for now', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, current: 0, needed: 1000 });
    expect(levelFromXp(2430)).toEqual({ level: 3, current: 430, needed: 1000 });
  });

  it('lets a penalty reduce progress inside the level (no protected threshold)', () => {
    expect(levelFromXp(1020 - 50)).toEqual({ level: 1, current: 970, needed: 1000 });
  });

  it('treats negative totals as zero', () => {
    expect(levelFromXp(-10).level).toBe(1);
  });
});
