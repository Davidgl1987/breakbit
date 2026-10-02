/** URL map. The router only resolves URL → layout/screen; no business logic lives here. */
export const ROUTES = {
  today: '/',
  progress: '/progress',
  settings: '/settings',
  gap: '/gap',
  dayEnd: '/day/end',
  devKit: '/dev/kit',
} as const;

/** Whether `pathname` is inside the section rooted at `to`. */
export function isRouteActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}
