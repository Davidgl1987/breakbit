import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Declarative routers don't restore scroll; start every screen at the top. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
