import { useT } from '@/i18n/useT';
import { promptInstall, useInstall } from '@/services/pwa/install';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './SettingsScreen.module.css';

/**
 * How to install Breakbit, while it isn't: the browser's own dialog where there is one
 * (Chromium), the steps in Safari on iPhone and iPad, and a general hint elsewhere.
 */
export function InstallCard() {
  const { t } = useT();
  const { installed, canPrompt, ios } = useInstall();
  if (installed) return null;
  return (
    <Card as="section" className={styles.card}>
      <div className={styles.headTexts}>
        <h2 className={styles.cardTitle}>
          <PixelIcon name="home_place" size={24} />
          {t('settings.install.title')}
        </h2>
        <p className={styles.muted}>{t('settings.install.body')}</p>
      </div>
      {canPrompt ? (
        <Button variant="secondary" onClick={() => void promptInstall()}>
          {t('settings.install.action')}
        </Button>
      ) : (
        <p className={styles.muted}>
          {ios ? t('settings.install.ios') : t('settings.install.other')}
        </p>
      )}
    </Card>
  );
}
