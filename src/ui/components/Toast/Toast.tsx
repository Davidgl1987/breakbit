import { useRef } from 'react';
import { cx } from '@/ui/cx';
import { AppIcon } from '@/ui/components/AppIcon/AppIcon';
import { LineIcon } from '@/ui/icons/LineIcon';
import { useLeaveAnimation } from '@/ui/motion/useLeaveAnimation';
import styles from './Toast.module.css';

export type ToastTone = 'success' | 'info' | 'warning';

interface ToastProps {
  message: string;
  tone?: ToastTone;
  closeLabel: string;
  onClose: () => void;
}

/** A brief confirmation floating over the screen; it drops in and lifts away. */
export function Toast({ message, tone = 'info', closeLabel, onClose }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLeaveAnimation(ref, styles.leaving!);
  return (
    <div ref={ref} className={cx(styles.toast, styles[tone])}>
      <AppIcon size={28} />
      <span className={styles.message}>{message}</span>
      <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
        <LineIcon name="close" size={16} />
      </button>
    </div>
  );
}
