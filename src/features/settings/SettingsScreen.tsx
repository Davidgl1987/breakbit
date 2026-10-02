import type { MessageKey } from '@/i18n/translate';
import { LOCALES, type Locale } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore, type ThemePreference } from '@/state/store';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { SegmentedControl } from '@/ui/components/SegmentedControl/SegmentedControl';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './SettingsScreen.module.css';

const THEMES: ThemePreference[] = ['light', 'dark', 'system'];

const UPCOMING: { icon: IconName; title: MessageKey }[] = [
  { icon: 'clock', title: 'settings.workday' },
  { icon: 'neck', title: 'settings.discomfort' },
  { icon: 'dumbbell', title: 'settings.equipment' },
  { icon: 'progress', title: 'settings.intensity' },
  { icon: 'bell', title: 'settings.notifications' },
];

export function SettingsScreen() {
  const { t } = useT();
  const theme = useAppStore((state) => state.prefs.theme);
  const locale = useAppStore((state) => state.prefs.locale);
  const setTheme = useAppStore((state) => state.setTheme);
  const setLocale = useAppStore((state) => state.setLocale);

  return (
    <>
      <ScreenHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

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

      <div className={styles.upcoming}>
        {UPCOMING.map((item) => (
          <ListRow
            key={item.title}
            leading={<PixelIcon name={item.icon} size={24} />}
            title={t(item.title)}
            subtitle={t('common.comingSoon')}
          />
        ))}
      </div>
    </>
  );
}
