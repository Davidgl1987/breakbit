import type { EvolutionPhase } from '@/domain/types';
import { AVATAR_ART } from './avatarArt';

/**
 * Stable entry point for art that doesn't exist yet. Components ask the registry and
 * render a placeholder when it has nothing; adding the final art only means adding
 * files and entries here, never touching components.
 */
export type AvatarPose = 'idle' | 'cheer' | 'celebrate' | 'thumbs_up' | 'demo';

// One 128x128 sprite per phase and pose (imported with scripts/pixel-avatar/import.py).
const AVATARS: Partial<Record<`${EvolutionPhase}:${AvatarPose}`, string>> = Object.fromEntries(
  AVATAR_ART.map((key) => [key, `${import.meta.env.BASE_URL}avatar/${key.replace(':', '-')}.png`]),
);

/** Art for a phase and pose (falls back to the phase's idle pose), if any. */
export function avatarAsset(phase: EvolutionPhase, pose: AvatarPose): string | undefined {
  return AVATARS[`${phase}:${pose}`] ?? AVATARS[`${phase}:idle`];
}
