import { useId, useRef } from 'react';
import { LineIcon } from '@/ui/icons/LineIcon';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './TimeField.module.css';

interface TimeFieldProps {
  label: string;
  /** 'HH:mm' */
  value: string;
  onChange: (value: string) => void;
  icon?: IconName;
  disabled?: boolean;
}

/** Labelled time picker card; uses the native picker for the best mobile UX. */
export function TimeField({ label, value, onChange, icon, disabled }: TimeFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      // showPicker is unsupported or not allowed here; focusing the input is enough.
    }
  };

  return (
    <div className={styles.field} data-disabled={disabled || undefined} onClick={openPicker}>
      {icon && <PixelIcon name={icon} size={24} />}
      <span className={styles.texts}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <input
          ref={inputRef}
          id={id}
          type="time"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={styles.input}
        />
      </span>
      <LineIcon name="chevron-down" size={18} className={styles.chevron} />
    </div>
  );
}
