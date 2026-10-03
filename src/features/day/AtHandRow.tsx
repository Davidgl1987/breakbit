import type { EquipmentId } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { EQUIPMENT_ICONS } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './day.module.css';

/** "A mano hoy": the equipment today's plan uses, as icons. Only shown when there is some. */
export function AtHandRow({ equipment }: { equipment: readonly EquipmentId[] }) {
  const { t } = useT();
  return (
    <ListRow
      title={t('today.atHand')}
      trailing={
        <span className={styles.icons}>
          {equipment.map((item) => (
            <PixelIcon
              key={item}
              name={EQUIPMENT_ICONS[item]}
              size={32}
              label={t(`equipment.${item}`)}
            />
          ))}
        </span>
      }
    />
  );
}
