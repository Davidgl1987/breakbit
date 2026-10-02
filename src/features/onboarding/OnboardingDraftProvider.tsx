import { useEffect, useState, type ReactNode } from 'react';
import type { UserSettings } from '@/domain/types';
import { useAppStore } from '@/state/store';
import { DraftContext } from './draftContext';
import { readOnboardingDraft, saveOnboardingDraft } from './draftStorage';

/** Holds the onboarding draft across steps (starts from any saved draft, else from settings). */
export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const saved = useAppStore((state) => state.settings);
  const [draft, setDraft] = useState<UserSettings>(() => readOnboardingDraft() ?? saved);

  useEffect(() => saveOnboardingDraft(draft), [draft]);

  return <DraftContext.Provider value={[draft, setDraft]}>{children}</DraftContext.Provider>;
}
