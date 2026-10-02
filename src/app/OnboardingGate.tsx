import { Navigate, Outlet } from 'react-router';
import { onboardingPath } from '@/features/onboarding/steps';
import { selectIsOnboarded } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { ROUTES } from './routes';

/** The app needs a finished onboarding; until then, everything leads to it. */
export function RequireOnboarding() {
  const onboarded = useAppStore(selectIsOnboarded);
  return onboarded ? <Outlet /> : <Navigate to={onboardingPath('welcome')} replace />;
}

/** Onboarding is only for new users; afterwards it leads to Today. */
export function RequirePendingOnboarding() {
  const onboarded = useAppStore(selectIsOnboarded);
  return onboarded ? <Navigate to={ROUTES.today} replace /> : <Outlet />;
}
