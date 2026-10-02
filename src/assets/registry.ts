import type { EvolutionPhase } from '@/domain/types';

/**
 * Stable entry point for art that doesn't exist yet. Components ask the registry and
 * render a placeholder when it has nothing; adding the final art only means adding
 * files and entries here, never touching components.
 */
export type AvatarPose = 'idle' | 'cheer' | 'celebrate' | 'thumbs_up' | 'demo';

const AVATARS: Partial<Record<`${EvolutionPhase}:${AvatarPose}`, string>> = {};

/** Art for a phase and pose (falls back to the phase's idle pose), if any. */
export function avatarAsset(phase: EvolutionPhase, pose: AvatarPose): string | undefined {
  return AVATARS[`${phase}:${pose}`] ?? AVATARS[`${phase}:idle`];
}
