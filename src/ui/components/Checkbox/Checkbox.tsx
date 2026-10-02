import type { ReactNode } from 'react';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label className={styles.row} data-disabled={disabled || undefined}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className={styles.native}
      />
      <span className={styles.box} aria-hidden="true">
        <LineIcon name="check" size={16} />
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
