import { useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { useT } from '@/i18n/useT';
import { analyticsAvailable, analyticsEnabled, setAnalyticsEnabled } from '@/services/analytics';
import { Card } from '@/ui/components/Card/Card';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { Toggle } from '@/ui/components/Toggle/Toggle';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { version } from '../../../package.json';
import styles from './SettingsScreen.module.css';

/**
 * What Breakbit is, and isn't: not a medical tool, and the user's data never leaves the
 * device. Anonymous usage statistics can be turned off here.
 */
export function AboutSection() {
  const { t } = useT();
  const [stats, setStats] = useState(analyticsEnabled);
  return (
    <>
      <IconButton label={t('settings.back')} to={ROUTES.settings}>
        <LineIcon name="back" size={22} />
      </IconButton>
      <ScreenHeader
        title={t('settings.about.title')}
        subtitle={t('settings.about.version', { version })}
      />
      <Card className={styles.about}>
        <p>{t('settings.about.body')}</p>
        <p className={styles.line}>
          <PixelIcon name="heart" size={24} />
          {t('settings.about.notMedical')}
        </p>
        <p className={styles.line}>
          <PixelIcon name="home_place" size={24} />
          {t('settings.about.privacy')}
        </p>
        {analyticsAvailable() && (
          <div className={styles.statsToggle}>
            <Toggle
              checked={stats}
              labelPosition="start"
              label={t('settings.about.analytics')}
              onChange={(enabled) => {
                setAnalyticsEnabled(enabled);
                setStats(enabled);
              }}
            />
            <p>{t('settings.about.analyticsHint')}</p>
          </div>
        )}
        <Link className={styles.privacyLink} to={ROUTES.privacy}>
          {t('settings.about.privacyLink')}
        </Link>
      </Card>
    </>
  );
}
