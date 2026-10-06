import type { Translate } from '@/i18n/useT';
import type { ReviewDecision, ReviewRating, ReviewScore } from './reviews';

/** Pending has no emoji: it is the absence of a decision. */
const DECISION_EMOJI: Record<ReviewDecision, string> = {
  pending: '',
  keep: '✅',
  rework: '🔧',
  delete: '🗑️',
};

/** "✅ Mantener", "Pendiente". */
export function decisionLabel(t: Translate, decision: ReviewDecision): string {
  const emoji = DECISION_EMOJI[decision];
  const label = t(`lab.decision.${decision}`);
  return emoji ? `${emoji} ${label}` : label;
}

/** Best first, as they are offered. */
export const RATINGS: {
  value: ReviewRating;
  emoji: string;
  key: 'great' | 'fine' | 'meh' | 'bad';
}[] = [
  { value: 4, emoji: '😍', key: 'great' },
  { value: 3, emoji: '👍', key: 'fine' },
  { value: 2, emoji: '😐', key: 'meh' },
  { value: 1, emoji: '👎', key: 'bad' },
];

export const SCORES: readonly ReviewScore[] = [1, 2, 3, 4, 5];
