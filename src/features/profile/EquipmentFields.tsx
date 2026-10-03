import { EQUIPMENT, type EquipmentId } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { EQUIPMENT_ICONS } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './profile.module.css';

/**
 * Equipment at hand, only for variety. Nothing ticked is `[]`: gear-free moves and
 * walking are the base of Breakbit and always available.
 */
export function EquipmentFields({
  value,
  onChange,
}: {
  value: readonly EquipmentId[];
  onChange: (equipment: EquipmentId[]) => void;
}) {
  const { t } = useT();
  const toggle = (item: EquipmentId, checked: boolean) =>
    onChange(EQUIPMENT.filter((other) => (other === item ? checked : value.includes(other))));
  return (
    <>
      <Card className={styles.section}>
        {EQUIPMENT.map((item) => (
          <Checkbox
            key={item}
            checked={value.includes(item)}
            onChange={(checked) => toggle(item, checked)}
            label={
              <span className={styles.option}>
                <PixelIcon name={EQUIPMENT_ICONS[item]} size={32} />
                <span className={styles.optionTexts}>
                  {t(`equipment.${item}`)}
                  <span className={styles.optionHint}>
                    {t(`onboarding.equipment.hints.${item}`)}
                  </span>
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
