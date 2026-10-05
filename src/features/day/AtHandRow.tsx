import type { EquipmentId } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { equipmentIcon, equipmentName } from './catalogDisplay';
import styles from './day.module.css';

/** "A mano hoy": the equipment today's plan uses, as icons. Only shown when there is some. */
export function AtHandRow({ equipment }: { equipment: readonly EquipmentId[] }) {
  const { t, locale } = useT();
  return (
    <ListRow
      title={t('today.atHand')}
      trailing={
        <span className={styles.icons}>
          {equipment.map((item) => (
            <PixelIcon
              key={item}
              name={equipmentIcon(item)}
              size={32}
              label={equipmentName(item, locale)}
            />
          ))}
        </span>
      }
    />
  );
}
