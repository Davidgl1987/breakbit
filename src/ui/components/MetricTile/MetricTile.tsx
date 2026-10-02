import type { ReactNode } from 'react';
import { cx } from '@/ui/cx';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './MetricTile.module.css';

interface MetricTileProps {
  icon: IconName;
  value: ReactNode;
  label: ReactNode;
  /** 'stacked': icon above (weekly stats). 'inline': icon at the side (day summary). */
  layout?: 'stacked' | 'inline';
}

export function MetricTile({ icon, value, label, layout = 'stacked' }: MetricTileProps) {
  return (
    <div className={cx(styles.tile, styles[layout])}>
      <PixelIcon name={icon} size={layout === 'inline' ? 32 : 24} />
      <div className={styles.texts}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
