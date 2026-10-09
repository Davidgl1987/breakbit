import { useState } from 'react';
import { equipmentIn } from '@/content/catalog';
import { areaName } from '@/features/day/catalogDisplay';
import type { BodyArea } from '@/domain/types';
import { weekdayName } from '@/i18n/translate';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { SettingsEditSheet, type RoutineSection } from './SettingsEditSheet';
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
export function SettingsScreen({
  initialSection,
  onCloseSection,
}: { initialSection?: RoutineSection; onCloseSection?: () => void } = {}) {
  const { t, locale } = useT();
  const [localSection, setSection] = useState<RoutineSection | null>(null);
  const section = initialSection ?? localSection;
  const close = () => {
    setSection(null);
    onCloseSection?.();
  };
  const settings = useAppStore((state) => state.settings);
  const theme = useAppStore((state) => state.prefs.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const setLocale = useAppStore((state) => state.setLocale);

  return (
    <>
      <ScreenHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <section className={styles.appSettings}>
        <h2 className={styles.sectionTitle}>{t('redesign.appSettings')}</h2>
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
      </section>
      <NotificationsCard />
      <section className={styles.routine}>
        <h2 className={styles.sectionTitle}>{t('redesign.routine')}</h2>
        {(
          [
            {
              id: 'schedule',
              title: t('settings.workday'),
              value: `${settings.workDays.map((day) => weekdayName(locale, day, 'short')).join(', ')} · ${settings.schedule.workStart}–${settings.schedule.workEnd}`,
            },
            {
              id: 'intensity',
              title: t('settings.intensity'),
              value: t(`intensity.${settings.intensity}`),
            },
            {
              id: 'equipment',
              title: t('settings.equipment'),
              value:
                equipmentIn(settings.equipment)
                  .map((item) => item.name[locale])
                  .join(', ') || t('onboarding.summary.noEquipment'),
            },
            {
              id: 'discomfort',
              title: t('settings.discomfort'),
              value:
                Object.entries(settings.discomfort)
                  .filter(([, value]) => (value ?? 0) > 0)
                  .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                  .map(([area]) => areaName(area as BodyArea, locale))
                  .join(', ') || t('onboarding.summary.noPriorities'),
            },
          ] as const
        ).map((item) => (
          <div key={item.id} className={styles.routineRow}>
            <ListRow
              ariaLabel={t('common.editSection', { section: item.title })}
              title={item.title}
              subtitle={item.value}
              onClick={() => setSection(item.id)}
              trailing={<span className={styles.edit}>{t('common.edit')}</span>}
              chevron={false}
            />
          </div>
        ))}
      </section>
      <InstallCard />
      <DataCard />
      {section && <SettingsEditSheet key={section} section={section} onClose={close} />}
    </>
  );
}
