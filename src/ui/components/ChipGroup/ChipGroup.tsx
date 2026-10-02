import { cx } from '@/ui/cx';
import { useRadioGroup, type RadioOption } from '../radioGroup';
import styles from './ChipGroup.module.css';

interface ChipGroupProps<T extends string> {
  label: string;
  /** Show the label above the chips; otherwise it is only announced. */
  showLabel?: boolean;
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Stretch chips to fill the row evenly. */
  fill?: boolean;
}

/** Single-select pill chips (intensity, break length…). */
export function ChipGroup<T extends string>({
  label,
  showLabel = false,
  options,
  value,
  onChange,
  fill = false,
}: ChipGroupProps<T>) {
  const { itemProps } = useRadioGroup(options, value, onChange);
  return (
    <div className={styles.wrapper}>
      {showLabel && <span className={styles.label}>{label}</span>}
      <div role="radiogroup" aria-label={label} className={cx(styles.group, fill && styles.fill)}>
        {options.map((option, index) => (
          <button
            key={option.value}
            {...itemProps(option, index)}
            className={cx(styles.chip, option.value === value && styles.selected)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
