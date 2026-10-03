import type { CSSProperties, ReactNode } from 'react';
import styles from './ProgressRing.module.css';

interface ProgressRingProps {
  /** 0 to 1. */
  progress: number;
  /** Accessible name, e.g. "Tiempo de la pausa". */
  label: string;
  /** Diameter in px. */
  size?: number;
  /** Shown in the middle (the remaining time). */
  children?: ReactNode;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Large circular progress, filling clockwise: the exercise timer. */
export function ProgressRing({ progress, label, size = 200, children }: ProgressRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={styles.ring}
      style={{ '--size': `${size}px` } as CSSProperties}
    >
      <svg viewBox="0 0 120 120" className={styles.svg} aria-hidden="true">
        <circle className={styles.track} cx="60" cy="60" r={RADIUS} />
        <circle
          className={styles.fill}
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
        />
      </svg>
      {children && <div className={styles.center}>{children}</div>}
    </div>
  );
}
