import { useSyncExternalStore } from 'react';
import { requestPersistentStorage } from '../storagePersistence';

/** Chromium's install prompt (not in the DOM types yet). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installedNow = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/**
 * Keeps Chromium's install prompt for when the user asks (it fires early, so this runs at
 * start-up). Once installed, asks the browser to keep the data: installed apps get it
 * without a prompt.
 */
export function initInstallPrompt(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installedNow = true;
    notify();
    void requestPersistentStorage();
  });
}

/** Opened as an installed app (home screen, dock…). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    installedNow ||
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iPhone and iPad (also iPadOS, which reports itself as a Mac with touch). */
export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** Shows the browser's install dialog, if it offered one. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = deferred;
  if (!event) return 'unavailable';
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferred = null;
  notify();
  return outcome;
}

export interface InstallState {
  installed: boolean;
  /** The browser offered its own install dialog (Chromium). */
  canPrompt: boolean;
  ios: boolean;
}

let snapshot: InstallState | null = null;
function getSnapshot(): InstallState {
  const next = { installed: isStandalone(), canPrompt: deferred !== null, ios: isIos() };
  if (
    !snapshot ||
    snapshot.installed !== next.installed ||
    snapshot.canPrompt !== next.canPrompt ||
    snapshot.ios !== next.ios
  ) {
    snapshot = next;
  }
  return snapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Whether Breakbit is installed and how it can be. */
export function useInstall(): InstallState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
