import { useSyncExternalStore, type ReactNode } from 'react';
import { useAppStore } from '@/state/store';
import { SplashScreen } from './SplashScreen';

const subscribe = (onChange: () => void) => useAppStore.persist.onFinishHydration(onChange);
const isHydrated = () => useAppStore.persist.hasHydrated();

/** Renders children only once the persisted state has been read from IndexedDB. */
export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, isHydrated, isHydrated);
  return hydrated ? children : <SplashScreen />;
}
