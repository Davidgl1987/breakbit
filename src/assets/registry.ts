import type { EvolutionPhase } from '@/domain/types';
import { AVATAR_ART } from './avatarArt';
import { EXERCISE_GUIDES, type ExerciseGuide } from './exerciseGuides';

/**
 * Stable entry point for art that doesn't exist yet. Components ask the registry and
 * render a placeholder when it has nothing; adding the final art only means adding
 * files and entries here, never touching components.
 */
export type AvatarPose = 'idle' | 'cheer' | 'celebrate' | 'thumbs_up' | 'demo' | 'sleep' | 'rest';

// One 128x128 sprite per phase and pose (imported with scripts/pixel-avatar/import.py).
const AVATARS: Partial<Record<`${EvolutionPhase}:${AvatarPose}`, string>> = Object.fromEntries(
  AVATAR_ART.map((key) => [key, `${import.meta.env.BASE_URL}avatar/${key.replace(':', '-')}.png`]),
);

/** Art for a phase and pose (falls back to the phase's idle pose), if any. */
export function avatarAsset(phase: EvolutionPhase, pose: AvatarPose): string | undefined {
  return AVATARS[`${phase}:${pose}`] ?? AVATARS[`${phase}:idle`];
}

/** The full demonstration sequence, when this exercise has guide art. */
export function exerciseGuide(exerciseId: string): ExerciseGuide | undefined {
  return EXERCISE_GUIDES[exerciseId];
}

/**
 * The demonstrations of several moves played one after another (each move once, in order),
 * for a preview of a pause with more than one. Moves without guide art are left out.
 */
export function movesGuide(exerciseIds: readonly string[]): ExerciseGuide | undefined {
  const guides = [...new Set(exerciseIds)].flatMap((id) => exerciseGuide(id) ?? []);
  if (guides.length <= 1) return guides[0];
  const frames: ExerciseGuide['frames'][number][] = [];
  const sequence: number[] = [];
  for (const guide of guides) {
    sequence.push(...guide.sequence.map((index) => index + frames.length));
    frames.push(...guide.frames);
  }
  return { frames, sequence };
}

/** First posture for static previews and availability checks in Exercise Lab. */
export function exerciseVisual(exerciseId: string): string | undefined {
  return exerciseGuide(exerciseId)?.frames[0]?.src;
}
