import { useNavigate } from 'react-router';
import { BODY_AREAS, type DiscomfortLevel } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { Slider05 } from '@/ui/components/Slider05/Slider05';
import { AREA_ICONS } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { useOnboardingDraft } from '../draftContext';
import styles from '../onboarding.module.css';
import { OnboardingStep } from '../OnboardingStep';
import { onboardingPath } from '../steps';

/** Step 3: 0–5 per area. Changes the mix of exercises, never the number of pauses. */
export function DiscomfortStep() {
  const { t } = useT();
  const navigate = useNavigate();
  const [draft, update] = useOnboardingDraft();

  return (
    <OnboardingStep
      step="discomfort"
      title={t('onboarding.discomfort.title')}
      subtitle={t('onboarding.discomfort.subtitle')}
      action={{ label: t('onboarding.next'), onClick: () => navigate(onboardingPath('equipment')) }}
    >
      <Card className={styles.section}>
        {BODY_AREAS.map((area) => (
          <Slider05
            key={area}
            label={t(`areas.${area}`)}
            icon={AREA_ICONS[area]}
            value={draft.discomfort[area]}
            onChange={(value) =>
              update((current) => ({
                ...current,
                discomfort: { ...current.discomfort, [area]: value as DiscomfortLevel },
              }))
            }
          />
        ))}
      </Card>
      <p className={`${styles.note} ${styles.muted}`}>
        <PixelIcon name="info" size={24} />
        {t('onboarding.discomfort.note')}
      </p>
    </OnboardingStep>
  );
}
