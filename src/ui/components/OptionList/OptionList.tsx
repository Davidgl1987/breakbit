import type { ReactNode } from 'react';
import { cx } from '@/ui/cx';
import type { IconName } from '@/ui/icons/iconNames';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { useRadioGroup } from '../radioGroup';
import styles from './OptionList.module.css';

export interface ListOption<T extends string> {
  value: T;
  label: string;
  description?: ReactNode;
  icon?: IconName;
}

interface OptionListProps<T extends string> {
  label: string;
  options: readonly ListOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Single-select list of rich options (today's activity, "Tengo un hueco" lengths…). */
export function OptionList<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionListProps<T>) {
  const { itemProps } = useRadioGroup(options, value, onChange);
  return (
    <div role="radiogroup" aria-label={label} className={styles.list}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            {...itemProps(option, index)}
            className={cx(styles.option, selected && styles.selected)}
          >
            {option.icon && <PixelIcon name={option.icon} size={32} />}
            <span className={styles.texts}>
              <span className={styles.label}>{option.label}</span>
              {option.description && (
                <span className={styles.description}>{option.description}</span>
              )}
            </span>
            <span className={styles.mark} aria-hidden="true">
              {selected && <LineIcon name="check" size={16} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
