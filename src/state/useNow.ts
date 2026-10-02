import { useCallback, useSyncExternalStore } from 'react';
import type { Instant } from '@/domain/types';
import { clock } from '@/services/clock';

/**
 * Current (possibly simulated) time, re-rendering only when it changes at the given
 * resolution: 1 s for a countdown, 30 s for "next pause in 18 min".
 */
export function useNow(resolutionMs = 1000): Instant {
  const getSnapshot = useCallback(
    () => Math.floor(clock.snapshot() / resolutionMs) * resolutionMs,
    [resolutionMs],
  );
  return useSyncExternalStore(clock.subscribe, getSnapshot, getSnapshot);
}
