import { useT } from '@/i18n/useT';
import { SegmentedProgress } from '../SegmentedProgress/SegmentedProgress';
import styles from './Stepper.module.css';

interface StepperProps {
  /** 1-based current step. */
  current: number;
  total: number;
}

export function Stepper({ current, total }: StepperProps) {
  const { t } = useT();
  return (
    <div className={styles.stepper}>
      <SegmentedProgress
        done={current}
        total={total}
        label={t('common.stepOf', { current, total })}
      />
      <span className={styles.count} aria-hidden="true">
        {current}/{total}
      </span>
    </div>
  );
}
