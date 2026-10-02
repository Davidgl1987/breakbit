import { cx } from '@/ui/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: 'rounded' | 'pill';
  fullWidth?: boolean;
  /** Visual "selected / active" state from the design system. */
  pressed?: boolean;
}

/** Class names for anything that should look like a button (e.g. a router Link). */
export function buttonClassName({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  fullWidth = false,
  pressed = false,
}: ButtonStyleOptions = {}): string {
  return cx(
    styles.button,
    styles[variant],
    styles[size],
    shape === 'pill' && styles.pill,
    fullWidth && styles.fullWidth,
    pressed && styles.pressed,
  );
}
