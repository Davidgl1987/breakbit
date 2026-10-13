import { Navigate, useParams } from 'react-router';
import { OnboardingDraftProvider } from './OnboardingDraftProvider';
import { DiscomfortStep } from './steps/DiscomfortStep';
import { EquipmentStep } from './steps/EquipmentStep';
import { IntensityStep } from './steps/IntensityStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { SummaryStep } from './steps/SummaryStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { IntroStep } from './steps/IntroStep';
import { isOnboardingStep, onboardingPath, type OnboardingStepId } from './steps';

const SCREENS: Record<OnboardingStepId, () => React.JSX.Element> = {
  intro: IntroStep,
  welcome: WelcomeStep,
  schedule: ScheduleStep,
  discomfort: DiscomfortStep,
  equipment: EquipmentStep,
  intensity: IntensityStep,
  summary: SummaryStep,
};

/** /onboarding/:step — brand, welcome and five steps sharing a draft until completion. */
export function OnboardingFlow() {
  const { step } = useParams();
  if (!isOnboardingStep(step)) return <Navigate to={onboardingPath('intro')} replace />;
  const Screen = SCREENS[step];
  return (
    <OnboardingDraftProvider>
      <Screen />
    </OnboardingDraftProvider>
  );
}
