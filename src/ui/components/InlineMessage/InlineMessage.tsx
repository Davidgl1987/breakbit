import type { ReactNode } from 'react';
import { cx } from '@/ui/cx';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './InlineMessage.module.css';

interface InlineMessageProps {
  /** 'hint': friendly tip ("Si puedes, hazlo mejor de pie"). 'danger': something to fix. */
  tone?: 'hint' | 'danger';
  icon?: IconName;
  children: ReactNode;
}

/** A short message inside a screen or form. Errors are announced to screen readers. */
export function InlineMessage({ tone = 'hint', icon, children }: InlineMessageProps) {
  return (
    <div
      className={cx(styles.message, styles[tone])}
      role={tone === 'danger' ? 'alert' : undefined}
    >
      {icon && <PixelIcon name={icon} size={24} />}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
