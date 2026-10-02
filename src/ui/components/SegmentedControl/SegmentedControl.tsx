import { cx } from '@/ui/cx';
import { useRadioGroup, type RadioOption } from '../radioGroup';
import styles from './SegmentedControl.module.css';

interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Connected single-select segments (theme, language…). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { itemProps } = useRadioGroup(options, value, onChange);
  return (
    <div role="radiogroup" aria-label={label} className={styles.track}>
      {options.map((option, index) => (
        <button
          key={option.value}
          {...itemProps(option, index)}
          className={cx(styles.segment, option.value === value && styles.selected)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
