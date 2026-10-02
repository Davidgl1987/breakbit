import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './Wordmark.module.css';

interface WordmarkProps {
  size?: 'md' | 'lg';
}

/** Breakbit logo: pixel sprout + display wordmark. */
export function Wordmark({ size = 'md' }: WordmarkProps) {
  return (
    <span className={`${styles.wordmark} ${styles[size]}`}>
      <PixelIcon name="plant" size={size === 'lg' ? 48 : 32} />
      <span className={styles.text}>Breakbit</span>
    </span>
  );
}
