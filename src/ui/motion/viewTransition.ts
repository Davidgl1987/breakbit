import { flushSync } from 'react-dom';

/** What a change of screen looks like; motion.css reads it from `<html data-transition>`. */
export type TransitionKind =
  'fade' | 'push' | 'pop' | 'slide-forward' | 'slide-back' | 'gap-open' | 'gap-close';

let inUpdate = false;
let running = 0;
let count = 0;

export function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function canAnimate(): boolean {
  return (
    typeof document.startViewTransition === 'function' &&
    document.visibilityState === 'visible' &&
    !prefersReducedMotion()
  );
}

/** A screen transition is under way: what closes now (a sheet) leaves with the old screen. */
export function isScreenTransitionRunning(): boolean {
  return running !== 0;
}

/** Inside a transition's update: changes now are part of the new screen. */
export function isInTransitionUpdate(): boolean {
  return inUpdate;
}

/** Sets (or corrects, from inside the update) how the running transition looks. */
export function setTransitionKind(kind: TransitionKind): void {
  document.documentElement.dataset.transition = kind;
}

/**
 * Where an expanding transition starts or ends (the "Tengo un hueco" button), as insets
 * of the viewport for motion.css. Read before and after the update: whichever screen
 * has it.
 */
function measureOrigin(): void {
  const origin = document.querySelector('[data-transition-origin]');
  if (!origin) return;
  const box = origin.getBoundingClientRect();
  const style = document.documentElement.style;
  style.setProperty('--vt-origin-top', `${box.top}px`);
  style.setProperty('--vt-origin-right', `${window.innerWidth - box.right}px`);
  style.setProperty('--vt-origin-bottom', `${window.innerHeight - box.bottom}px`);
  style.setProperty('--vt-origin-left', `${box.left}px`);
  style.setProperty('--vt-origin-radius', `${box.height / 2}px`);
}

/**
 * Animates a change of screen with the View Transitions API: the browser keeps a picture
 * of the screen as it is, `update` runs (synchronously, so the new screen is in place
 * when it returns) and both pictures animate as `kind` says.
 *
 * Start it before changing anything: an action that saves and then navigates passes both
 * in `update`, so the old picture is the screen the user was looking at. Without support,
 * with reduced motion, or already inside an update, `update` just runs.
 */
export function runScreenTransition(update: () => void, kind: TransitionKind = 'fade'): void {
  if (inUpdate || !canAnimate()) {
    update();
    return;
  }
  const id = ++count;
  running = id;
  setTransitionKind(kind);
  measureOrigin();
  const transition = document.startViewTransition(() => {
    inUpdate = true;
    try {
      flushSync(update);
    } finally {
      inUpdate = false;
    }
    measureOrigin();
  });
  // Skipped (another one started, the tab was hidden…): nothing to report.
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (running !== id) return;
      running = 0;
      delete document.documentElement.dataset.transition;
    });
}
