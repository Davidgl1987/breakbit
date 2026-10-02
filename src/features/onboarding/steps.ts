export const ONBOARDING_STEPS = [
  'welcome',
  'schedule',
  'discomfort',
  'equipment',
  'intensity',
  'summary',
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

export function onboardingPath(step: OnboardingStepId): string {
  return `/onboarding/${step}`;
}

export function isOnboardingStep(value: string | undefined): value is OnboardingStepId {
  return (ONBOARDING_STEPS as readonly string[]).includes(value ?? '');
}

export function stepIndex(step: OnboardingStepId): number {
  return ONBOARDING_STEPS.indexOf(step);
}

export function previousStep(step: OnboardingStepId): OnboardingStepId | undefined {
  return ONBOARDING_STEPS[stepIndex(step) - 1];
}

export function nextStep(step: OnboardingStepId): OnboardingStepId | undefined {
  return ONBOARDING_STEPS[stepIndex(step) + 1];
}
