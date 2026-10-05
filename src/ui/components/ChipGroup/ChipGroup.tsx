import { cx } from '@/ui/cx';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { useRadioGroup, type RadioOption } from '../radioGroup';
import styles from './ChipGroup.module.css';

export interface ChipOption<T extends string> extends RadioOption<T> {
  /** With icons, chips become tiles: the icon above its label. */
  icon?: IconName;
}

interface ChipGroupProps<T extends string> {
  label: string;
  /** Show the label above the chips; otherwise it is only announced. */
  showLabel?: boolean;
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Stretch chips to fill the row evenly. */
  fill?: boolean;
}

/** Single-select pill chips (break length…), or tiles with an icon (intensity, mood). */
export function ChipGroup<T extends string>({
  label,
  showLabel = false,
  options,
  value,
  onChange,
  fill = false,
}: ChipGroupProps<T>) {
  const { itemProps } = useRadioGroup(options, value, onChange);
  const tiles = options.some((option) => option.icon);
  return (
    <div className={styles.wrapper}>
      {showLabel && <span className={styles.label}>{label}</span>}
      <div
        role="radiogroup"
        aria-label={label}
        className={cx(styles.group, fill && styles.fill, tiles && styles.tiles)}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            {...itemProps(option, index)}
            className={cx(styles.chip, option.value === value && styles.selected)}
          >
            {option.icon && <PixelIcon name={option.icon} size={32} />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
