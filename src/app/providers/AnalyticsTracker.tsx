import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { trackActiveDay, trackScreen } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';

/**
 * Counts each screen opened and, once a day, that a set-up user is back (see
 * services/analytics). Internal tools aren't counted.
 */
export function AnalyticsTracker() {
  const { pathname } = useLocation();
  const onboardedAt = useAppStore((state) => state.onboardedAt);

  useEffect(() => {
    if (pathname.startsWith('/dev/')) return;
    trackScreen(pathname);
  }, [pathname]);

  useEffect(() => {
    if (onboardedAt !== undefined) trackActiveDay(onboardedAt, clock.now());
  }, [onboardedAt]);

  return null;
}
