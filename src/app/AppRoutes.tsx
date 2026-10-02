import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DayEndScreen } from '@/features/day-end/DayEndScreen';
import { GapScreen } from '@/features/gap/GapScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { TodayScreen } from '@/features/today/TodayScreen';
import { FullscreenLayout } from './layouts/FullscreenLayout';
import { TabsLayout } from './layouts/TabsLayout';

// Dev-only screen; the dynamic import is dropped from production builds.
const DevKitScreen = import.meta.env.DEV
  ? lazy(() => import('./dev/DevKitScreen').then((module) => ({ default: module.DevKitScreen })))
  : null;

/** URL → layout/screen. Declarative mode only: no loaders, actions or business logic. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<TabsLayout />}>
        <Route index element={<TodayScreen />} />
        <Route path="progress" element={<ProgressScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="gap" element={<GapScreen />} />
        {DevKitScreen && (
          <Route
            path="dev/kit"
            element={
              <Suspense fallback={null}>
                <DevKitScreen />
              </Suspense>
            }
          />
        )}
      </Route>
      <Route element={<FullscreenLayout />}>
        <Route path="day/end" element={<DayEndScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
