import { cx } from '@/ui/cx';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './RoomScene.module.css';

export interface RoomSceneItem {
  id: string;
  name: string;
  icon: IconName;
}

interface RoomSceneProps {
  label: string;
  /** What the room has, in the order it arrived. */
  items: readonly RoomSceneItem[];
  /** How many items the room can hold; the rest show as empty slots. */
  capacity: number;
  /** The item that just arrived. */
  highlight?: string;
  /** Small tag on the item that just arrived ("Nuevo"). */
  newLabel?: string;
}

/**
 * The avatar's room, which keeps improving once the avatar is at its top phase. The
 * pixel icons are placeholders until the room has its own art.
 */
export function RoomScene({ label, items, capacity, highlight, newLabel }: RoomSceneProps) {
  const empty = Math.max(0, capacity - items.length);
  return (
    <div className={styles.room}>
      <ul className={styles.slots} aria-label={label}>
        {items.map((item) => (
          <li
            key={item.id}
            className={cx(styles.slot, item.id === highlight && styles.highlighted)}
          >
            <PixelIcon name={item.icon} size={32} label={item.name} />
            {item.id === highlight && newLabel && <span className={styles.badge}>{newLabel}</span>}
          </li>
        ))}
        {Array.from({ length: empty }, (_, index) => (
          <li
            key={`empty-${index}`}
            className={cx(styles.slot, styles.locked)}
            aria-hidden="true"
          />
        ))}
      </ul>
    </div>
  );
}
