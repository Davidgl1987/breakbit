import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNow } from '@/state/useNow';
import { clock } from './clock';

describe('clock', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 9, 5, 9, 0, 0) });
  });
  afterEach(() => {
    clock.setOffset(0);
    vi.useRealTimers();
  });

  it('returns the real time without an offset', () => {
    expect(clock.now()).toBe(new Date(2026, 9, 5, 9, 0, 0).getTime());
  });

  it('travels in time (dev) and remembers the offset across reloads', () => {
    clock.travelTo(new Date(2026, 9, 5, 16, 50).getTime());
    expect(new Date(clock.now()).getHours()).toBe(16);
    expect(localStorage.getItem('breakbit:dev-clock-offset')).toBe(String(clock.offset()));
  });

  it('gives React a stable snapshot between ticks', () => {
    const unsubscribe = clock.subscribe(() => {});
    const first = clock.snapshot();
    vi.setSystemTime(Date.now() + 400); // time passes, but no tick yet
    expect(clock.snapshot()).toBe(first);
    vi.advanceTimersByTime(1000);
    expect(clock.snapshot()).toBeGreaterThan(first);
    unsubscribe();
  });

  it('notifies subscribers on every tick and on time travel', () => {
    const listener = vi.fn();
    const unsubscribe = clock.subscribe(listener);
    vi.advanceTimersByTime(3000);
    expect(listener).toHaveBeenCalledTimes(3);
    clock.setOffset(60_000);
    expect(listener).toHaveBeenCalledTimes(4);
    unsubscribe();
    vi.advanceTimersByTime(3000);
    expect(listener).toHaveBeenCalledTimes(4);
  });
});

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 9, 5, 9, 0, 10) });
  });
  afterEach(() => {
    clock.setOffset(0);
    vi.useRealTimers();
  });

  it('updates at the requested resolution', () => {
    const { result } = renderHook(() => useNow(30_000));
    const first = result.current;
    expect(first).toBe(new Date(2026, 9, 5, 9, 0, 0).getTime());
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current).toBe(first);
    act(() => vi.advanceTimersByTime(15_000));
    expect(result.current).toBe(first + 30_000);
  });

  it('follows time travel immediately', () => {
    const { result } = renderHook(() => useNow());
    act(() => clock.travelTo(new Date(2026, 9, 5, 13, 0).getTime()));
    expect(new Date(result.current).getHours()).toBe(13);
  });
});
