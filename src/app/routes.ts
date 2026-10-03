/** URL map. The router only resolves URL → layout/screen; no business logic lives here. */
export const ROUTES = {
  today: '/',
  progress: '/progress',
  settings: '/settings',
  gap: '/gap',
  dayStart: '/day/start',
  dayEnd: '/day/end',
  devKit: '/dev/kit',
} as const;

/** The decision screen of a pause ("Vamos" / postpone / discard). */
export function pausePath(id: string): string {
  return `/pause/${encodeURIComponent(id)}`;
}

/** The exercise itself, after "Vamos". */
export function pausePlayPath(id: string): string {
  return `${pausePath(id)}/play`;
}

/** The celebration once the exercise is done. */
export function pauseDonePath(id: string): string {
  return `${pausePath(id)}/done`;
}

/** Today's main activity: what it is, then its session once started. */
export function mainPath(id: string): string {
  return `/main/${encodeURIComponent(id)}`;
}

/** The celebration once the main activity is done. */
export function mainDonePath(id: string): string {
  return `${mainPath(id)}/done`;
}

/** "Tengo un hueco": a proposal for the time chosen. */
export function gapPath(option: string): string {
  return `${ROUTES.gap}/${option}`;
}

/** Whether `pathname` is inside the section rooted at `to`. */
export function isRouteActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}
