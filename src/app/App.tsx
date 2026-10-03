import { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router';
import { AppRoutes } from './AppRoutes';
import { Engine } from './engine/Engine';
import { HydrationGate } from './providers/HydrationGate';
import { ThemeController } from './providers/ThemeController';

// Dev-only tools; the dynamic import is dropped from production builds.
const DevPanel = import.meta.env.DEV
  ? lazy(() => import('./dev/DevPanel').then((module) => ({ default: module.DevPanel })))
  : null;

export function App() {
  return (
    <BrowserRouter>
      <ThemeController />
      <HydrationGate>
        <Engine />
        <AppRoutes />
        {DevPanel && (
          <Suspense fallback={null}>
            <DevPanel />
          </Suspense>
        )}
      </HydrationGate>
    </BrowserRouter>
  );
}
