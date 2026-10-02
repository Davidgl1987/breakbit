import { Navigate, useParams } from 'react-router';
import { OnboardingDraftProvider } from './OnboardingDraftProvider';
import { DiscomfortStep } from './steps/DiscomfortStep';
import { EquipmentStep } from './steps/EquipmentStep';
import { IntensityStep } from './steps/IntensityStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { SummaryStep } from './steps/SummaryStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { isOnboardingStep, onboardingPath, type OnboardingStepId } from './steps';

const SCREENS: Record<OnboardingStepId, () => React.JSX.Element> = {
  welcome: WelcomeStep,
  schedule: ScheduleStep,
  discomfort: DiscomfortStep,
  equipment: EquipmentStep,
  intensity: IntensityStep,
  summary: SummaryStep,
};

/** /onboarding/:step — one screen per step, sharing a draft until "Empezar". */
export function OnboardingFlow() {
  const { step } = useParams();
  if (!isOnboardingStep(step)) return <Navigate to={onboardingPath('welcome')} replace />;
  const Screen = SCREENS[step];
  return (
    <OnboardingDraftProvider>
      <Screen />
    </OnboardingDraftProvider>
  );
}
