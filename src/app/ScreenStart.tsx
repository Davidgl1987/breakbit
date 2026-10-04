import { useLayoutEffect, useRef } from 'react';

/**
 * Every new screen starts at the top (declarative routers don't restore scroll) and, after
 * a navigation, with focus on its title: keyboard and screen-reader users start there
 * instead of on the link they left behind. The first screen keeps the browser's focus.
 * Before paint, so a screen transition already shows the new screen from the top.
 */
export function ScreenStart({ pathname }: { pathname: string }) {
  const first = useRef(true);
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (first.current) {
      first.current = false;
      return;
    }
    const target =
      document.querySelector<HTMLElement>('main h1') ?? document.querySelector<HTMLElement>('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}
