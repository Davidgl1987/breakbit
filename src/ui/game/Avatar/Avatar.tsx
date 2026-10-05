import { avatarAsset, type AvatarPose } from '@/assets/registry';
import type { EvolutionPhase } from '@/domain/types';
import { cx } from '@/ui/cx';
import { PHASE_PLACEHOLDER_ICONS } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './Avatar.module.css';

interface AvatarProps {
  phase: EvolutionPhase;
  pose?: AvatarPose;
  /** 'fluid' fills its container up to 64px (strips that must fit any width). */
  size?: 'fluid' | 'sm' | 'md' | 'lg';
  /** Accessible description; omit when a visible caption says the same. */
  label?: string;
  highlighted?: boolean;
  /** Without its own box, for art placed on a stage. */
  framed?: boolean;
}

/** The user's avatar. Renders a pixel placeholder until the final art is in the registry. */
export function Avatar({
  phase,
  pose = 'idle',
  size = 'md',
  label,
  highlighted,
  framed = true,
}: AvatarProps) {
  const src = avatarAsset(phase, pose);
  return (
    <span
      className={cx(
        styles.avatar,
        styles[size],
        highlighted && styles.highlighted,
        !framed && styles.bare,
      )}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-placeholder={src ? undefined : true}
    >
      {src ? (
        <img src={src} alt="" className={styles.art} draggable={false} />
      ) : (
        <PixelIcon
          name={PHASE_PLACEHOLDER_ICONS[phase]}
          size={size === 'sm' || size === 'fluid' ? 32 : 48}
          className={styles.placeholder}
        />
      )}
    </span>
  );
}
