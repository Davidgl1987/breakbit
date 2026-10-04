import { ONBOARDING_STEPS } from '@/features/onboarding/steps';
import type { TransitionKind } from '@/ui/motion/viewTransition';
import { isRouteActive, ROUTES } from '../routes';

const TABS: string[] = [ROUTES.today, ROUTES.progress, ROUTES.settings];
const ONBOARDING = '/onboarding/';

function inGap(path: string): boolean {
  return isRouteActive(path, ROUTES.gap);
}

/** Screens with the bottom bar (and its "Tengo un hueco" button). */
function hasNav(path: string): boolean {
  return TABS.some((tab) => isRouteActive(path, tab));
}

function tabIndex(path: string): number {
  return TABS.findIndex((tab) => isRouteActive(path, tab));
}

function onboardingStep(path: string): number {
  if (!path.startsWith(ONBOARDING)) return -1;
  return (ONBOARDING_STEPS as readonly string[]).indexOf(path.slice(ONBOARDING.length));
}

/**
 * How deep a screen sits: the tabs and the onboarding 0, what opens from them 1, and the
 * steps of a pause or an activity after that (decision → exercise → done).
 */
export function screenDepth(path: string): number {
  if (TABS.includes(path) || path.startsWith(ONBOARDING)) return 0;
  const [section, , step] = path.split('/').filter(Boolean);
  if (section === 'pause') return step === 'done' ? 3 : step === 'play' ? 2 : 1;
  if (section === 'main') return step === 'done' ? 2 : 1;
  if (section === 'gap') return path === ROUTES.gap ? 1 : 2;
  return 1;
}

/**
 * The motion between two screens: tabs and onboarding steps slide side to side, "Tengo un
 * hueco" grows out of its button and shrinks back into it, going deeper rises and coming
 * back drops. Anything else cross-fades.
 */
export function transitionKind(from: string, to: string): TransitionKind {
  if (inGap(to) && !inGap(from)) return 'gap-open';
  if (inGap(from) && !inGap(to)) return hasNav(to) ? 'gap-close' : 'push';

  const fromTab = tabIndex(from);
  const toTab = tabIndex(to);
  if (fromTab >= 0 && toTab >= 0 && fromTab !== toTab) {
    return toTab > fromTab ? 'slide-forward' : 'slide-back';
  }
  const fromStep = onboardingStep(from);
  const toStep = onboardingStep(to);
  if (fromStep >= 0 && toStep >= 0 && fromStep !== toStep) {
    return toStep > fromStep ? 'slide-forward' : 'slide-back';
  }

  const depth = screenDepth(to) - screenDepth(from);
  return depth > 0 ? 'push' : depth < 0 ? 'pop' : 'fade';
}
