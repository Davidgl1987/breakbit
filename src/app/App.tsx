import { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router';
import { AppRoutes } from './AppRoutes';
import { Engine } from './engine/Engine';
import { HydrationGate } from './providers/HydrationGate';
import { ToastHost } from './ToastHost';
import { ThemeController } from './providers/ThemeController';

// Dev-only tools; the dynamic import is dropped from production builds.
const DevPanel = import.meta.env.DEV
  ? lazy(() => import('./dev/DevPanel').then((module) => ({ default: module.DevPanel })))
  : null;

export function App() {
  return (
    // Navigations update synchronously, so a view transition's update has the new screen.
    // Routes are relative to where the app lives ('/', or '/breakbit/' on GitHub Pages); the
    // trailing slash keeps Today at '/breakbit/', inside the service worker's scope.
    <BrowserRouter basename={import.meta.env.BASE_URL} useTransitions={false}>
      <ThemeController />
      <HydrationGate>
        <Engine />
        <AppRoutes />
        <ToastHost />
        {DevPanel && (
          <Suspense fallback={null}>
            <DevPanel />
          </Suspense>
        )}
      </HydrationGate>
    </BrowserRouter>
  );
}
