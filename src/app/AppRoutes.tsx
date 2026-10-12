import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DayEndScreen } from '@/features/day-end/DayEndScreen';
import { DayStartScreen } from '@/features/day-start/DayStartScreen';
import { DecisionScreen } from '@/features/pause/DecisionScreen';
import { DoneScreen } from '@/features/pause/DoneScreen';
import { PlayScreen } from '@/features/pause/PlayScreen';
import { GapProposalScreen } from '@/features/gap/GapProposalScreen';
import { GapScreen } from '@/features/gap/GapScreen';
import { gapReturnPath } from '@/features/gap/gapReturn';
import { ROUTES } from './routes';
import { useToday } from '@/features/day/useToday';
import { MainDoneScreen } from '@/features/main-activity/MainDoneScreen';
import { MainScreen } from '@/features/main-activity/MainScreen';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { SettingsSectionScreen } from '@/features/settings/SettingsSectionScreen';
import { TodayScreen } from '@/features/today/TodayScreen';
import { WeekScreen } from '@/features/week/WeekScreen';
import { FullscreenLayout } from './layouts/FullscreenLayout';
import { TabsLayout } from './layouts/TabsLayout';
import { RequireOnboarding, RequirePendingOnboarding } from './OnboardingGate';
import { ScreenStart } from './ScreenStart';
import { useScreenLocation } from './transitions/useScreenLocation';

// Dev-only screen; the dynamic import is dropped from production builds.
const DevKitScreen = import.meta.env.DEV
  ? lazy(() => import('./dev/DevKitScreen').then((module) => ({ default: module.DevKitScreen })))
  : null;
// Internal tool, in production too: nothing links to it, it opens from its URL. Loaded only
// when opened.
const ExerciseLabScreen = lazy(() =>
  import('./dev/exercise-lab/ExerciseLabScreen').then((module) => ({
    default: module.ExerciseLabScreen,
  })),
);

/**
 * URL → layout/screen. Declarative mode only: no loaders, actions or business logic. The
 * screens follow the URL through a view transition (`useScreenLocation`).
 */
export function AppRoutes() {
  const { state } = useToday();
  const location = useScreenLocation(state.kind === 'active' ? ROUTES.gap : undefined);
  // Keep the originating tab mounted while choosing time, including its scroll and focus.
  // A direct /gap URL uses Today as its background. Inactive days have a full screen.
  const gapOpen = location.pathname === ROUTES.gap && state.kind === 'active';
  const background = gapOpen
    ? {
        ...location,
        pathname: gapReturnPath(location.state),
        search: '',
        hash: '',
      }
    : location;
  return (
    <>
      <ScreenStart pathname={background.pathname} />
      <Routes location={background}>
        <Route element={<RequireOnboarding />}>
          <Route element={<TabsLayout />}>
            <Route index element={<TodayScreen />} />
            <Route path="progress" element={<ProgressScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
            <Route path="settings/:section" element={<SettingsSectionScreen />} />
          </Route>
          <Route element={<FullscreenLayout />}>
            <Route path="day/start" element={<DayStartScreen />} />
            <Route path="gap" element={<GapScreen />} />
            <Route path="gap/:option" element={<GapProposalScreen />} />
            <Route path="pause/:id" element={<DecisionScreen />} />
            <Route path="pause/:id/play" element={<PlayScreen />} />
            <Route path="pause/:id/done" element={<DoneScreen />} />
            <Route path="main/:id" element={<MainScreen />} />
            <Route path="main/:id/done" element={<MainDoneScreen />} />
            <Route path="day/end" element={<DayEndScreen />} />
            <Route path="week/:week" element={<WeekScreen />} />
          </Route>
        </Route>

        <Route element={<RequirePendingOnboarding />}>
          <Route element={<FullscreenLayout />}>
            <Route path="onboarding/:step" element={<OnboardingFlow />} />
          </Route>
        </Route>

        {DevKitScreen && (
          <Route element={<TabsLayout />}>
            <Route
              path="dev/kit"
              element={
                <Suspense fallback={null}>
                  <DevKitScreen />
                </Suspense>
              }
            />
          </Route>
        )}
        {/* A desk tool: the whole window, outside the app's column and its guards. */}
        <Route
          path="dev/exercises"
          element={
            <Suspense fallback={null}>
              <ExerciseLabScreen />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {gapOpen && (
        <Routes location={location}>
          <Route element={<RequireOnboarding />}>
            <Route path="gap" element={<GapScreen />} />
          </Route>
        </Routes>
      )}
    </>
  );
}
