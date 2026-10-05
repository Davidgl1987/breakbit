import { settingsPath } from '@/app/routes';
import {
  EquipmentSummary,
  PaceSummary,
  PrioritiesSummary,
  WorkdaySummary,
} from '@/features/profile/ProfileSummary';
import { LOCALES, type Locale } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore, type ThemePreference } from '@/state/store';
import { Card } from '@/ui/components/Card/Card';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { SegmentedControl } from '@/ui/components/SegmentedControl/SegmentedControl';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { DataCard } from './DataCard';
import { InstallCard } from './InstallCard';
import { NotificationsCard } from './NotificationsCard';
import styles from './SettingsScreen.module.css';

const THEMES: ThemePreference[] = ['light', 'dark', 'system'];

/**
 * "/settings": the usual workday, discomfort, equipment and pace (shown as in the
 * onboarding summary and edited with the onboarding's forms), reminders, appearance,
 * language and the user's data.
 */
export function SettingsScreen() {
  const { t, locale } = useT();
  const settings = useAppStore((state) => state.settings);
  const theme = useAppStore((state) => state.prefs.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const setLocale = useAppStore((state) => state.setLocale);

  return (
    <>
      <ScreenHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <WorkdaySummary
        title={t('settings.workday')}
        editTo={settingsPath('schedule')}
        workDays={settings.workDays}
        schedule={settings.schedule}
      />
      <PrioritiesSummary
        title={t('settings.discomfort')}
        editTo={settingsPath('discomfort')}
        discomfort={settings.discomfort}
      />
      <EquipmentSummary
        title={t('settings.equipment')}
        editTo={settingsPath('equipment')}
        equipment={settings.equipment}
      />
      <PaceSummary
        title={t('settings.intensity')}
        editTo={settingsPath('intensity')}
        settings={settings}
      />

      <NotificationsCard />

      <Card className={styles.prefRow}>
        <span className={styles.prefLabel}>
          <PixelIcon name="monitor" size={24} />
          {t('settings.appearance')}
        </span>
        <SegmentedControl
          label={t('settings.appearance')}
          value={theme}
          onChange={setTheme}
          options={THEMES.map((value) => ({ value, label: t(`settings.theme.${value}`) }))}
        />
      </Card>

      <Card className={styles.prefRow}>
        <span className={styles.prefLabel}>
          <PixelIcon name="reading" size={24} />
          {t('settings.language')}
        </span>
        <SegmentedControl<Locale>
          label={t('settings.language')}
          value={locale}
          onChange={setLocale}
          options={LOCALES.map((value) => ({ value, label: t(`settings.languages.${value}`) }))}
        />
      </Card>

      <InstallCard />
      <DataCard />
    </>
  );
}
