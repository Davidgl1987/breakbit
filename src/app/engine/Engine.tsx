import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { clock } from '@/services/clock';
import { createLocalScheduler } from '@/services/notifications/scheduler';
import { onServiceWorkerNavigate } from '@/services/pwa/serviceWorker';
import { selectIsOnboarded } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { notificationContent } from './notificationContent';
import { runEngine } from './runEngine';

/** How often the day is moved forward while the app is open. */
const TICK_MS = 15_000;

/**
 * Keeps the day in step with the clock: on start, every 15 s, after the user's actions,
 * when the app comes back to the front and on dev time travel. Renders nothing.
 */
export function Engine() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  const onboarded = useAppStore(selectIsOnboarded);

  useEffect(() => {
    if (!onboarded) return;
    const scheduler = createLocalScheduler({
      render: (notification) => notificationContent(notification, useAppStore.getState()),
      onOpen: (url) => navigateRef.current(url),
    });
    let lastSlot = -1;
    const tick = (force: boolean) => {
      const now = clock.now();
      const slot = Math.floor(now / TICK_MS);
      if (!force && slot === lastSlot) return;
      lastSlot = slot;
      runEngine(now, scheduler);
    };
    const wake = () => tick(true);

    tick(true);
    const unsubscribe = clock.subscribe(() => tick(false));
    // After the user's answers too (reconciling again is a no-op, so this settles at once).
    const unsubscribeStore = useAppStore.subscribe((state, previous) => {
      if (state.days !== previous.days) tick(true);
    });
    window.addEventListener('focus', wake);
    document.addEventListener('visibilitychange', wake);
    const stopListening = onServiceWorkerNavigate((path) => navigateRef.current(path));
    return () => {
      unsubscribe();
      unsubscribeStore();
      window.removeEventListener('focus', wake);
      document.removeEventListener('visibilitychange', wake);
      stopListening();
    };
  }, [onboarded]);

  return null;
}
