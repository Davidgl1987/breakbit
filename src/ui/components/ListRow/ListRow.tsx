import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './ListRow.module.css';

interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  /** Short value shown before the chevron (e.g. the current language). */
  trailing?: ReactNode;
  to?: string;
  /** Router state for the link. */
  state?: unknown;
  onClick?: () => void;
  chevron?: boolean;
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  to,
  state,
  onClick,
  chevron,
}: ListRowProps) {
  const showChevron = chevron ?? Boolean(to || onClick);
  const content = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.texts}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
      {showChevron && <LineIcon name="chevron-right" size={18} className={styles.chevron} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} state={state} className={styles.row}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={styles.row}>
        {content}
      </button>
    );
  }
  return <div className={styles.row}>{content}</div>;
}
