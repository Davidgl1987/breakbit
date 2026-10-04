import type { ReactNode } from 'react';
import { cx } from '@/ui/cx';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './Tag.module.css';

interface TagProps {
  icon?: IconName;
  children: ReactNode;
  /** After the label (a value, like how much an area bothers). */
  trailing?: ReactNode;
}

/** A static label (a chosen area, a piece of gear). Same pill shape as chips, not clickable. */
export function Tag({ icon, children, trailing }: TagProps) {
  return (
    <span
      className={cx(styles.tag, icon && styles.withIcon, trailing != null && styles.withTrailing)}
    >
      {icon && <PixelIcon name={icon} size={24} />}
      {trailing != null ? <span>{children}</span> : children}
      {trailing}
    </span>
  );
}
