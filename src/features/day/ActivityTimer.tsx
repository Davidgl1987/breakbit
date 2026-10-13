import { formatTimer } from '@/i18n/translate';
import styles from './ActivityTimer.module.css';

interface ActivityTimerProps {
  progress: number;
  label: string;
  seconds: number;
  status: string;
  caption?: string;
}

/** Time lives in its own strip below the guide, including when paused or between blocks. */
export function ActivityTimer({ progress, label, seconds, status, caption }: ActivityTimerProps) {
  const percent = Math.min(1, Math.max(0, progress)) * 100;
  return (
    <div
      className={styles.timer}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${status}: ${formatTimer(seconds)} ${caption ?? ''}`}
    >
      <div className={styles.row}>
        <span className={styles.status}>{status}</span>
        <div className={styles.value}>
          <strong className={styles.time}>{formatTimer(seconds)}</strong>
          {caption && <span className={styles.caption}>{caption}</span>}
        </div>
      </div>
      <div className={styles.track} aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
