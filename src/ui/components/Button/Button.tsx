import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/ui/cx';
import { buttonClassName, type ButtonStyleOptions } from './buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
}

export function Button({
  variant,
  size,
  shape,
  fullWidth,
  pressed,
  iconStart,
  iconEnd,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cx(buttonClassName({ variant, size, shape, fullWidth, pressed }), className)}
      {...rest}
    >
      {iconStart}
      {children}
      {iconEnd}
    </button>
  );
}
