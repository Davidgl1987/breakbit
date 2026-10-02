import type { ReactNode } from 'react';
import { cx } from '@/ui/cx';
import styles from './Toggle.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  /** 'start' puts the label first (settings rows), 'end' after the switch. */
  labelPosition?: 'start' | 'end';
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, labelPosition = 'end', disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(styles.row, labelPosition === 'start' && styles.labelStart)}
    >
      <span className={cx(styles.track, checked && styles.on)} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
