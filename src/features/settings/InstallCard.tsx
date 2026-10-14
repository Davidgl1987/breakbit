import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { promptInstall, useInstall } from '@/services/pwa/install';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { AppIcon } from '@/ui/components/AppIcon/AppIcon';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './SettingsScreen.module.css';

/**
 * How to install Breakbit, while it isn't: the browser's own dialog where there is one
 * (Chromium), the steps in Safari on iPhone and iPad, and a general hint elsewhere.
 */
export function InstallCard() {
  const { t } = useT();
  const { installed, canPrompt, ios } = useInstall();
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const install = async () => {
    setBusy(true);
    try {
      if ((await promptInstall()) === 'unavailable') setHelp(true);
    } catch {
      setHelp(true);
    } finally {
      setBusy(false);
    }
  };
  if (installed) return null;
  return (
    <Card as="section" className={styles.card}>
      <div className={styles.headTexts}>
        <h2 className={styles.cardTitle}>
          <AppIcon size={36} />
          {t('special.install.cardTitle')}
        </h2>
        <p className={styles.muted}>{t('special.install.body')}</p>
      </div>
      {canPrompt ? (
        <Button variant="secondary" disabled={busy} onClick={() => void install()}>
          {t('settings.install.action')}
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => setHelp(true)}>
          {t('special.install.help')} <LineIcon name="chevron-right" size={18} />
        </Button>
      )}
      <BottomSheet
        open={help}
        onClose={() => setHelp(false)}
        title={t('settings.install.title')}
        titleVariant="pixel"
        scrollBody
        actions={
          <Button fullWidth onClick={() => setHelp(false)}>
            {t('special.understood')}
          </Button>
        }
      >
        <div className={styles.specialBody}>
          <div className={styles.appPreview}>
            <AppIcon size={40} />
            <p>{t('special.install.tagline')}</p>
          </div>
          <ol className={styles.helpSteps}>
            <li>{ios ? t('special.install.iosOpen') : t('special.install.menuOpen')}</li>
            <li>{ios ? t('special.install.iosChoose') : t('special.install.menuChoose')}</li>
            <li>{t('special.install.finish')}</li>
          </ol>
          <p className={styles.muted}>
            {ios ? t('special.install.iosHint') : t('special.install.otherHint')}
          </p>
        </div>
      </BottomSheet>
    </Card>
  );
}
