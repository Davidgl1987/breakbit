import type { IconName } from './iconNames';
import styles from './PixelIcon.module.css';

export type PixelIconSize = 16 | 24 | 32 | 48;

interface PixelIconProps {
  name: IconName;
  size?: PixelIconSize;
  /** Accessible label. Omit for decorative icons next to visible text. */
  label?: string;
  className?: string;
}

function pixelIconUrl(name: IconName, size: PixelIconSize): string {
  return `${import.meta.env.BASE_URL}icons/${size}/${name}.png`;
}

/** Pixel-art icon from the Breakbit library, rendered crisp at its native size. */
export function PixelIcon({ name, size = 24, label, className }: PixelIconProps) {
  return (
    <img
      src={pixelIconUrl(name, size)}
      width={size}
      height={size}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      className={className ? `${styles.icon} ${className}` : styles.icon}
      draggable={false}
      decoding="async"
    />
  );
}
