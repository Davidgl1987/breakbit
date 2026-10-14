import { useT } from '@/i18n/useT';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import styles from './SplashScreen.module.css';

export function SplashScreen() {
  const { t } = useT();
  return (
    <div className={styles.splash} role="status" aria-label={t('app.loading')}>
      <div className={styles.content}>
        <Wordmark size="lg" />
        <span className={styles.pixels} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <p className={styles.caption}>{t('special.loading')}</p>
      </div>
    </div>
  );
}
