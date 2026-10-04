import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, type Location } from 'react-router';
import {
  isInTransitionUpdate,
  runScreenTransition,
  setTransitionKind,
} from '@/ui/motion/viewTransition';
import { transitionKind } from './transitionKind';

function samePlace(a: Location, b: Location): boolean {
  return a.pathname === b.pathname && a.search === b.search;
}

/**
 * The location the screens show. It follows the URL through a view transition: the old
 * screen stays until the browser has its picture, then the new one takes over and both
 * animate. A change of screen that an action already animates (it saves and navigates
 * inside `runScreenTransition`) just switches, setting the motion for where it goes.
 */
export function useScreenLocation(): Location {
  const location = useLocation();
  const [shown, setShown] = useState(location);
  const latest = useRef(location);
  const pending = useRef(false);
  // Back with a swipe on iOS: the browser has animated it already.
  const animatedByBrowser = useRef(false);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      animatedByBrowser.current =
        'hasUAVisualTransition' in event && event.hasUAVisualTransition === true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useLayoutEffect(() => {
    latest.current = location;
    if (location === shown) return;
    const kind = transitionKind(shown.pathname, location.pathname);
    // Switching right here is the point: the browser has the old picture (or needs none).
    if (isInTransitionUpdate()) {
      setTransitionKind(kind);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
      setShown(location);
      return;
    }
    if (samePlace(location, shown) || animatedByBrowser.current) {
      animatedByBrowser.current = false;
      setShown(location);
      return;
    }
    // A transition on its way picks up the latest location when it switches.
    if (pending.current) return;
    pending.current = true;
    runScreenTransition(() => {
      pending.current = false;
      setShown(latest.current);
    }, kind);
  }, [location, shown]);

  return shown;
}
