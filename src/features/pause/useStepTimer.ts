import { useEffect, useRef, useState } from 'react';
import { clock } from '@/services/clock';
import { useNow } from '@/state/useNow';

/**
 * Taps this soon after the move changed are ignored: a double tap on "Siguiente", or a
 * tap as the time ran out, belongs to the move that just ended, not to the next one (it
 * neither skips nor starts it).
 */
export const STEP_TAP_GUARD_MS = 800;

interface TimerState {
  index: number;
  /** When the current run started; null while paused. */
  runningSince: number | null;
  /** Time already run in the current step before the last pause. */
  stepMs: number;
  /** Time run in the steps already finished. */
  doneMs: number;
  /** When the step last changed; null on the first one. */
  changedAt: number | null;
}

export interface StepTimer {
  index: number;
  running: boolean;
  /** The current step hasn't been started yet: the user reads it first. */
  ready: boolean;
  /** 0–1 through the current step. */
  progress: number;
  remainingSec: number;
  pause: () => void;
  /** Starts the current step, or carries on after a pause. */
  resume: () => void;
  /** Moves on to the next step, or finishes after the last one. One step per tap. */
  next: () => void;
}

/**
 * Counts down each step from timestamps, so it stays right when the tab sleeps. Every
 * step waits to be started, so reading it doesn't eat into its time; the next one waits
 * too. Calls `onFinish` with the seconds actually moved once the last step ends or is
 * skipped.
 */
export function useStepTimer(
  stepSeconds: readonly number[],
  onFinish: (elapsedSec: number) => void,
): StepTimer {
  const now = useNow(250);
  const [state, setState] = useState<TimerState>(() => ({
    index: 0,
    runningSince: null,
    stepMs: 0,
    doneMs: 0,
    changedAt: null,
  }));
  const finished = useRef(false);
  const justChanged = () =>
    state.changedAt !== null && clock.now() - state.changedAt < STEP_TAP_GUARD_MS;

  const stepMs = (stepSeconds[state.index] ?? 0) * 1000;
  const runMs = (at: number) =>
    state.stepMs + (state.runningSince === null ? 0 : Math.max(0, at - state.runningSince));
  const elapsedMs = Math.min(runMs(now), stepMs);

  const advance = () => {
    const at = clock.now();
    const ran = Math.min(runMs(at), stepMs);
    if (state.index >= stepSeconds.length - 1) {
      if (finished.current) return;
      finished.current = true;
      setState((current) => ({ ...current, runningSince: null }));
      onFinish((state.doneMs + ran) / 1000);
      return;
    }
    const from = state.index;
    // Guarded by index: a repeated call never skips a step.
    setState((current) =>
      current.index !== from
        ? current
        : {
            index: from + 1,
            runningSince: null,
            stepMs: 0,
            doneMs: current.doneMs + ran,
            changedAt: at,
          },
    );
  };

  // A step that runs out moves on by itself.
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });
  const timeUp = state.runningSince !== null && elapsedMs >= stepMs;
  useEffect(() => {
    if (timeUp) advanceRef.current();
  }, [timeUp, state.index]);

  return {
    index: state.index,
    running: state.runningSince !== null,
    ready: state.runningSince === null && state.stepMs === 0,
    progress: stepMs > 0 ? elapsedMs / stepMs : 1,
    remainingSec: Math.ceil((stepMs - elapsedMs) / 1000),
    pause: () =>
      setState((current) =>
        current.runningSince === null
          ? current
          : {
              ...current,
              runningSince: null,
              stepMs: current.stepMs + Math.max(0, clock.now() - current.runningSince),
            },
      ),
    resume: () => {
      if (justChanged()) return;
      setState((current) =>
        current.runningSince === null ? { ...current, runningSince: clock.now() } : current,
      );
    },
    next: () => {
      if (justChanged()) return;
      advance();
    },
  };
}
