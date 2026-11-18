/**
 * Public contact points, set at build time (repository variables in the deploy workflow) so
 * no address lives in the code. Each is optional: what isn't set isn't shown.
 */
const FEEDBACK_URL = (import.meta.env.VITE_FEEDBACK_URL as string | undefined) || undefined;
export const CONTACT_EMAIL =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || undefined;

/** Where "Send feedback" leads: a form when there is one, else an email. */
export function feedbackHref(subject: string): string | undefined {
  if (FEEDBACK_URL) return FEEDBACK_URL;
  if (CONTACT_EMAIL) return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  return undefined;
}

/** The day the privacy policy last changed; update it with the policy's text. */
export const PRIVACY_UPDATED = '2026-11-18';
