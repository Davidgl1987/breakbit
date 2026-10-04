import { useLayoutEffect, type RefObject } from 'react';
import { isScreenTransitionRunning, prefersReducedMotion } from './viewTransition';

/**
 * Plays an element's exit animation after React removes it, whatever removed it (its own
 * close button, the parent's state, a confirm that also navigates): an inert copy stays
 * in its place with `leavingClass`, which runs the animation, and goes when it ends.
 *
 * Not when the whole screen is changing (the element leaves with the old screen's
 * picture), with reduced motion, or without the Web Animations API (tests).
 */
export function useLeaveAnimation(
  ref: RefObject<HTMLElement | null>,
  leavingClass: string,
  active = true,
): void {
  useLayoutEffect(() => {
    const node = ref.current;
    const parent = node?.parentElement;
    if (!active || !node || !parent) return;
    return () => {
      // After the commit: still in the page means it wasn't really removed (React's
      // development double effects).
      queueMicrotask(() => {
        if (node.isConnected || !parent.isConnected) return;
        if (typeof node.getAnimations !== 'function') return;
        if (isScreenTransitionRunning() || prefersReducedMotion()) return;
        const ghost = node.cloneNode(true) as HTMLElement;
        ghost.inert = true;
        ghost.setAttribute('aria-hidden', 'true');
        for (const element of [ghost, ...ghost.querySelectorAll('[id]')])
          element.removeAttribute('id');
        ghost.classList.add(leavingClass);
        parent.appendChild(ghost);
        const remove = () => ghost.remove();
        Promise.all(
          ghost.getAnimations({ subtree: true }).map((animation) => animation.finished),
        ).then(remove, remove);
        // In case an animation never starts or ends (a hidden tab).
        setTimeout(remove, 1000);
      });
    };
  }, [ref, leavingClass, active]);
}
