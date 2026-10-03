import { useNavigate } from 'react-router';
import { DiscomfortFields } from '@/features/profile/DiscomfortFields';
import { useT } from '@/i18n/useT';
import { useOnboardingDraft } from '../draftContext';
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
      <DiscomfortFields
        value={draft.discomfort}
        onChange={(discomfort) => update((current) => ({ ...current, discomfort }))}
      />
    </OnboardingStep>
  );
}
