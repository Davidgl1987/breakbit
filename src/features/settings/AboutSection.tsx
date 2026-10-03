import { ROUTES } from '@/app/routes';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { version } from '../../../package.json';
import styles from './SettingsScreen.module.css';

/** What Breakbit is, and isn't: not a medical tool, and nothing leaves the device. */
export function AboutSection() {
  const { t } = useT();
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
      </Card>
    </>
  );
}
