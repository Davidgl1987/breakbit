import type { ReactNode } from 'react';
import { useT } from '@/i18n/useT';
import { cx } from '@/ui/cx';
import { LineIcon } from '@/ui/icons/LineIcon';
import { IconButton } from '../IconButton/IconButton';
import styles from './ScreenHeader.module.css';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * 'page': large display title for top-level screens.
   * 'bar': compact centered title with back/close, for flows (exercise, gap…).
   */
  variant?: 'page' | 'bar';
  backTo?: string;
  closeTo?: string;
  /** Extra content on the right of a 'page' header (illustration, action). */
  trailing?: ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  variant = 'page',
  backTo,
  closeTo,
  trailing,
}: ScreenHeaderProps) {
  const { t } = useT();

  if (variant === 'bar') {
    return (
      <header className={cx(styles.header, styles.bar)}>
        <span className={styles.side}>
          {backTo && (
            <IconButton label={t('common.back')} to={backTo}>
              <LineIcon name="chevron-left" size={24} />
            </IconButton>
          )}
        </span>
        <h1 className={styles.barTitle}>{title}</h1>
        <span className={cx(styles.side, styles.sideEnd)}>
          {closeTo && (
            <IconButton label={t('common.close')} to={closeTo}>
              <LineIcon name="close" size={22} />
            </IconButton>
          )}
        </span>
      </header>
    );
  }

  return (
    <header className={cx(styles.header, styles.page)}>
      <div className={styles.pageTexts}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {trailing}
    </header>
  );
}
