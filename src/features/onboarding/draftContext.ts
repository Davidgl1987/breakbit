import { createContext, useContext } from 'react';
import type { UserSettings } from '@/domain/types';

export type DraftContextValue = [
  UserSettings,
  (update: (draft: UserSettings) => UserSettings) => void,
];

export const DraftContext = createContext<DraftContextValue | null>(null);

/** The onboarding draft and its updater. */
export function useOnboardingDraft(): DraftContextValue {
  const value = useContext(DraftContext);
  if (!value) throw new Error('useOnboardingDraft must be used inside OnboardingDraftProvider');
  return value;
}
