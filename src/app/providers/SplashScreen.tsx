import { useT } from '@/i18n/useT';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import styles from './SplashScreen.module.css';

export function SplashScreen() {
  const { t } = useT();
  return (
    <div className={styles.splash} role="status" aria-label={t('app.loading')}>
      <Wordmark size="lg" />
    </div>
  );
}
