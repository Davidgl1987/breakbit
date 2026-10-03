import { useNavigate } from 'react-router';
import { EquipmentFields } from '@/features/profile/EquipmentFields';
import { useT } from '@/i18n/useT';
import { useOnboardingDraft } from '../draftContext';
import { OnboardingStep } from '../OnboardingStep';
import { onboardingPath } from '../steps';

/** Step 4: equipment at hand, only to add variety; nothing ticked is fine. */
export function EquipmentStep() {
  const { t } = useT();
  const navigate = useNavigate();
  const [draft, update] = useOnboardingDraft();

  return (
    <OnboardingStep
      step="equipment"
      title={t('onboarding.equipment.title')}
      subtitle={t('onboarding.equipment.subtitle')}
      action={{ label: t('onboarding.next'), onClick: () => navigate(onboardingPath('intensity')) }}
    >
      <EquipmentFields
        value={draft.equipment}
        onChange={(equipment) => update((current) => ({ ...current, equipment }))}
      />
    </OnboardingStep>
  );
}
