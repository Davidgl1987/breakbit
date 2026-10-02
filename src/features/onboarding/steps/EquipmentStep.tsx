import { useNavigate } from 'react-router';
import { EQUIPMENT, type EquipmentId } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { EQUIPMENT_ICONS } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { useOnboardingDraft } from '../draftContext';
import styles from '../onboarding.module.css';
import { OnboardingStep } from '../OnboardingStep';
import { onboardingPath } from '../steps';

/**
 * Step 4: equipment at hand, only to add variety. Nothing ticked is `equipment: []`:
 * gear-free moves and walking are the base of Breakbit and always available.
 */
export function EquipmentStep() {
  const { t } = useT();
  const navigate = useNavigate();
  const [draft, update] = useOnboardingDraft();
  const toggle = (item: EquipmentId, checked: boolean) =>
    update((current) => ({
      ...current,
      equipment: EQUIPMENT.filter((other) =>
        other === item ? checked : current.equipment.includes(other),
      ),
    }));

  return (
    <OnboardingStep
      step="equipment"
      title={t('onboarding.equipment.title')}
      subtitle={t('onboarding.equipment.subtitle')}
      action={{ label: t('onboarding.next'), onClick: () => navigate(onboardingPath('intensity')) }}
    >
      <Card className={styles.section}>
        {EQUIPMENT.map((item) => (
          <Checkbox
            key={item}
            checked={draft.equipment.includes(item)}
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
    </OnboardingStep>
  );
}
