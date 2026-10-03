import type { CSSProperties } from 'react';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './Celebration.module.css';

/** Where each sparkle pops, as % of the stage, and when. */
const SPARKLES: { icon: IconName; x: number; y: number; delay: number }[] = [
  { icon: 'xp', x: 18, y: 22, delay: 0 },
  { icon: 'success', x: 80, y: 18, delay: 120 },
  { icon: 'xp', x: 86, y: 70, delay: 240 },
  { icon: 'level_up', x: 12, y: 72, delay: 360 },
];

/** Pixel sparkles over the avatar when a pause is done. Still for reduced motion. */
export function Celebration() {
  return (
    <div className={styles.layer} aria-hidden="true">
      {SPARKLES.map((sparkle, index) => (
        <span
          key={index}
          className={styles.sparkle}
          style={
            {
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animationDelay: `${sparkle.delay}ms`,
            } as CSSProperties
          }
        >
          <PixelIcon name={sparkle.icon} size={24} />
        </span>
      ))}
    </div>
  );
}
