import { formatTimer } from '@/i18n/translate';
import { ProgressRing } from '@/ui/components/ProgressRing/ProgressRing';
import styles from './TimerRing.module.css';

interface TimerRingProps {
  /** 0–1. */
  progress: number;
  label: string;
  seconds: number;
  /** Under the time: "En pausa", "quedan"… */
  caption?: string;
}

/** The big centred ring of a pause or activity, with its time. */
export function TimerRing({ progress, label, seconds, caption }: TimerRingProps) {
  return (
    <div className={styles.timer}>
      <ProgressRing progress={progress} label={label}>
        <span className={styles.time}>{formatTimer(seconds)}</span>
        {caption && <span className={styles.caption}>{caption}</span>}
      </ProgressRing>
    </div>
  );
}
