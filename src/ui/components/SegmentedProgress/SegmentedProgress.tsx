import { cx } from '@/ui/cx';
import styles from './SegmentedProgress.module.css';

interface SegmentedProgressProps {
  done: number;
  total: number;
  /** Accessible name, e.g. "2 de 6 pausas". */
  label: string;
}

/** One segment per unit — "6 de 8 pausas", exercise steps, onboarding steps. */
export function SegmentedProgress({ done, total, label }: SegmentedProgressProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={Math.min(done, total)}
      className={styles.segments}
    >
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={cx(styles.segment, index < done && styles.filled)} />
      ))}
    </div>
  );
}
