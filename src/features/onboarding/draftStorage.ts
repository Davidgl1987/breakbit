import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { UserSettings } from '@/domain/types';

/**
 * The settings being chosen during onboarding are an unsent draft: kept in
 * sessionStorage so a reload mid-way doesn't lose them; only "Empezar" saves them.
 */
const DRAFT_KEY = 'breakbit:onboarding-draft';

/** A saved draft, completed with defaults for anything missing; null if absent or broken. */
export function readOnboardingDraft(): UserSettings | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserSettings> | null;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      discomfort: { ...DEFAULT_SETTINGS.discomfort, ...parsed.discomfort },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
    };
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: UserSettings): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage may be unavailable (private mode); the draft just won't survive a reload.
  }
}

export function clearOnboardingDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}
