import { isRouteActive, ROUTES } from '@/app/routes';

/** Router state along the "Tengo un hueco" flow: the screen it was opened from. */
export interface GapState {
  from: string;
}

/** Where closing "Tengo un hueco" goes back to: the screen it was opened from, or Today. */
export function gapReturnPath(state: unknown): string {
  const from = (state as Partial<GapState> | null)?.from;
  return typeof from === 'string' && /^\/(?!\/)/.test(from) && !isRouteActive(from, ROUTES.gap)
    ? from
    : ROUTES.today;
}
