import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cx } from '@/ui/cx';
import styles from './IconButton.module.css';

interface IconButtonProps {
  /** Accessible name; the icon itself is decorative. */
  label: string;
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'plain' | 'soft';
  className?: string;
}

export function IconButton({
  label,
  children,
  to,
  onClick,
  variant = 'plain',
  className,
}: IconButtonProps) {
  const classes = cx(styles.iconButton, styles[variant], className);
  if (to) {
    return (
      <Link to={to} aria-label={label} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
