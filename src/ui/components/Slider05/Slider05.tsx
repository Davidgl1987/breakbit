import { useId, type CSSProperties } from 'react';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './Slider05.module.css';

interface Slider05Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: IconName;
  max?: number;
}

/** Discrete 0–5 slider used for discomfort priorities. */
export function Slider05({ label, value, onChange, icon, max = 5 }: Slider05Props) {
  const id = useId();
  const fill = `${(value / max) * 100}%`;
  return (
    <div className={styles.row}>
      {icon && <PixelIcon name={icon} size={32} />}
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={styles.range}
        style={{ '--fill': fill } as CSSProperties}
      />
      <output htmlFor={id} className={styles.value}>
        {value}
      </output>
    </div>
  );
}
