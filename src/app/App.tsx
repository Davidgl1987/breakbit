import { BrowserRouter } from 'react-router';
import { AppRoutes } from './AppRoutes';
import { HydrationGate } from './providers/HydrationGate';
import { ThemeController } from './providers/ThemeController';

export function App() {
  return (
    <BrowserRouter>
      <ThemeController />
      <HydrationGate>
        <AppRoutes />
      </HydrationGate>
    </BrowserRouter>
  );
}
