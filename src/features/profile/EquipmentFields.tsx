import { CATALOG } from '@/content/catalog';
import type { EquipmentId } from '@/domain/types';
import { equipmentIcon } from '@/features/day/catalogDisplay';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './profile.module.css';

/**
 * The catalog's equipment the user has at hand, only for variety. Nothing ticked is `[]`: gear-free moves and
 * walking are the base of Breakbit and always available.
 */
export function EquipmentFields({
  value,
  onChange,
}: {
  value: readonly EquipmentId[];
  onChange: (equipment: EquipmentId[]) => void;
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
      <Card className={styles.section}>
        {CATALOG.equipment.map((item) => (
          <Checkbox
            key={item.id}
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
        ))}
      </Card>
      <p className={`${styles.note} ${styles.muted}`}>
        <PixelIcon name="walk" size={24} />
        {t('onboarding.equipment.always')}
      </p>
    </>
  );
}
