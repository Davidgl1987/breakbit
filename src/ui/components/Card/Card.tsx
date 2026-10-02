import type { HTMLAttributes } from 'react';
import { cx } from '@/ui/cx';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: 'standard' | 'compact' | 'tinted' | 'muted';
  as?: 'div' | 'section' | 'article';
}

export function Card({ variant = 'standard', as: Element = 'div', className, ...rest }: CardProps) {
  return <Element className={cx(styles.card, styles[variant], className)} {...rest} />;
}
