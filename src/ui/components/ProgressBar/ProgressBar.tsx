import { cx } from '@/ui/cx';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  /** Accessible name, e.g. "Nivel 3". */
  label: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max = 1, label, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      className={cx(styles.track, styles[size])}
    >
      <span className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
