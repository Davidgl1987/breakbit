import { useNavigate } from 'react-router';
import { IntensityFields } from '@/features/profile/IntensityFields';
import { useT } from '@/i18n/useT';
import { useOnboardingDraft } from '../draftContext';
import { OnboardingStep } from '../OnboardingStep';
import { onboardingPath } from '../steps';

/** Step 5: pace, with what it means for the user's own workday. */
export function IntensityStep() {
  const { t } = useT();
  const navigate = useNavigate();
  const [draft, update] = useOnboardingDraft();

  return (
    <OnboardingStep
      step="intensity"
      title={t('onboarding.intensity.title')}
      subtitle={t('onboarding.intensity.subtitle')}
      action={{ label: t('onboarding.next'), onClick: () => navigate(onboardingPath('summary')) }}
    >
      <IntensityFields
        settings={draft}
        onChange={(intensity) => update((current) => ({ ...current, intensity }))}
      />
    </OnboardingStep>
  );
}
