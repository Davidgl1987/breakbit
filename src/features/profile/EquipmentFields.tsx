import { CATALOG } from '@/content/catalog';
import type { EquipmentId } from '@/domain/types';
import { equipmentIcon } from '@/features/day/catalogDisplay';
import { useT } from '@/i18n/useT';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './profile.module.css';

/**
 * The catalog's equipment the user has at hand, only for variety. Nothing ticked is `[]`: gear-free moves and
 * walking are the base of Breakbit and always available. `items` limits the list (today's
 * equipment offers only the user's own).
 */
export function EquipmentFields({
  value,
  onChange,
  items,
}: {
  value: readonly EquipmentId[];
  onChange: (equipment: EquipmentId[]) => void;
  items?: readonly EquipmentId[];
}) {
  const { t, locale } = useT();
  const toggle = (item: EquipmentId, checked: boolean) =>
    onChange(
      CATALOG.equipment
        .map((other) => other.id)
        .filter((other) => (other === item ? checked : value.includes(other))),
    );
  return (
    <>
      <p className={`${styles.note} ${styles.muted}`}>
        <PixelIcon name="walk" size={24} />
        {t('onboarding.equipment.always')}
      </p>
      <div className={styles.equipment}>
        {CATALOG.equipment
          .filter((item) => !items || items.includes(item.id))
          .map((item) => (
            <div className={styles.equipmentRow} key={item.id}>
              <Checkbox
                labelPosition="start"
                checked={value.includes(item.id)}
                onChange={(checked) => toggle(item.id, checked)}
                label={
                  <span className={styles.option}>
                    <PixelIcon name={equipmentIcon(item.id)} size={32} />
                    <span className={styles.optionTexts}>
                      {item.name[locale]}
                      <span className={styles.optionHint}>{item.hint[locale]}</span>
                    </span>
                  </span>
                }
              />
            </div>
          ))}
      </div>
    </>
  );
}
