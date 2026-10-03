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
  /** Only for buttons (a link can't be disabled). */
  disabled?: boolean;
  variant?: 'plain' | 'soft';
  className?: string;
}

export function IconButton({
  label,
  children,
  to,
  onClick,
  disabled = false,
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
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
