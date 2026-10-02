import { cx } from '@/ui/cx';
import styles from './ChipGroup.module.css';

export interface MultiChipOption<T extends string> {
  value: T;
  label: string;
  /** Full name when the visible label is abbreviated (e.g. "L" → "lunes"). */
  ariaLabel?: string;
}

interface MultiChipGroupProps<T extends string> {
  label: string;
  showLabel?: boolean;
  options: readonly MultiChipOption<T>[];
  values: readonly T[];
  onChange: (values: T[]) => void;
  fill?: boolean;
}

/** Multi-select toggle chips (workdays…), same look as the single-select ChipGroup. */
export function MultiChipGroup<T extends string>({
  label,
  showLabel = false,
  options,
  values,
  onChange,
  fill = false,
}: MultiChipGroupProps<T>) {
  const toggle = (value: T) =>
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : options
            .map((option) => option.value)
            .filter((item) => item === value || values.includes(item)),
    );

  return (
    <div className={styles.wrapper}>
      {showLabel && <span className={styles.label}>{label}</span>}
      <div role="group" aria-label={label} className={cx(styles.group, fill && styles.fill)}>
        {options.map((option) => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              aria-label={option.ariaLabel}
              onClick={() => toggle(option.value)}
              className={cx(styles.chip, selected && styles.selected)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
