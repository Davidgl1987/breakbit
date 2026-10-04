import { cx } from '@/ui/cx';
import styles from './Wordmark.module.css';

interface WordmarkProps {
  size?: 'md' | 'lg';
}

const SOURCES = {
  light: { src: 'brand/wordmark-light.png', width: 619 },
  dark: { src: 'brand/wordmark-dark.png', width: 607 },
} as const;

/**
 * The Breakbit wordmark from the logo pack: dark green on the light theme, mint on the
 * dark one (the theme, not the system, decides: both are in the page and CSS shows one).
 */
export function Wordmark({ size = 'md' }: WordmarkProps) {
  return (
    <span className={cx(styles.wordmark, styles[size])}>
      {(['light', 'dark'] as const).map((theme) => (
        <img
          key={theme}
          src={`${import.meta.env.BASE_URL}${SOURCES[theme].src}`}
          width={SOURCES[theme].width}
          height={132}
          alt="Breakbit"
          className={styles[theme]}
          draggable={false}
        />
      ))}
    </span>
  );
}
