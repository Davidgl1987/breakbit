import { settingsPath } from '@/app/routes';
import { CONTACT_EMAIL, PRIVACY_UPDATED } from '@/app/site';
import { onboardingPath } from '@/features/onboarding/steps';
import { useT } from '@/i18n/useT';
import { selectIsOnboarded } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { Card } from '@/ui/components/Card/Card';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import type { IconName } from '@/ui/icons/iconNames';
import styles from './PrivacyScreen.module.css';

const SECTIONS: { id: 'data' | 'notifications' | 'stats' | 'health'; icon: IconName }[] = [
  { id: 'data', icon: 'home_place' },
  { id: 'notifications', icon: 'bell' },
  { id: 'stats', icon: 'progress' },
  { id: 'health', icon: 'heart' },
];

/** "/privacy": the privacy policy, public so stores and the landing can link to it. */
export function PrivacyScreen() {
  const { t, locale } = useT();
  const onboarded = useAppStore(selectIsOnboarded);
  return (
    <div className={styles.screen}>
      <IconButton
        label={t('privacy.back')}
        to={onboarded ? settingsPath('about') : onboardingPath('intro')}
      >
        <LineIcon name="back" size={22} />
      </IconButton>
      <ScreenHeader
        title={t('privacy.title')}
        subtitle={t('privacy.updated', {
          date: new Date(`${PRIVACY_UPDATED}T12:00:00`).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        })}
      />
      {SECTIONS.map((section) => (
        <Card key={section.id} className={styles.section}>
          <h2 className={styles.title}>
            <PixelIcon name={section.icon} size={24} />
            {t(`privacy.${section.id}.title`)}
          </h2>
          <p>{t(`privacy.${section.id}.body`)}</p>
          {section.id === 'stats' && <p>{t('privacy.stats.optOut')}</p>}
        </Card>
      ))}
      {CONTACT_EMAIL && (
        <p className={styles.contact}>
          {t('privacy.contact')} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      )}
    </div>
  );
}
