import { useMemo } from 'react';
import { Link } from 'react-router';
import { settingsPath } from '@/app/routes';
import { toDateKey } from '@/domain/time';
import { equipmentIn } from '@/content/catalog';
import { equipmentIcon } from '@/features/day/catalogDisplay';
import { PriorityTags } from '@/features/profile/PriorityTags';
import { estimateDay } from '@/features/onboarding/estimate';
import { LOCALES, weekdayName, type Locale } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { useAppStore, type ThemePreference } from '@/state/store';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { SegmentedControl } from '@/ui/components/SegmentedControl/SegmentedControl';
import type { IconName } from '@/ui/icons/iconNames';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { DataCard } from './DataCard';
import { InstallCard } from './InstallCard';
import { NotificationsCard } from './NotificationsCard';
import styles from './SettingsScreen.module.css';

const THEMES: ThemePreference[] = ['light', 'dark', 'system'];

/**
 * "/settings": the usual workday, discomfort, equipment and pace (each edited with the
 * onboarding's forms), reminders, appearance, language and the user's data.
 */
export function SettingsScreen() {
  const { t, locale } = useT();
  const settings = useAppStore((state) => state.settings);
  const theme = useAppStore((state) => state.prefs.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const setLocale = useAppStore((state) => state.setLocale);
  const { schedule } = settings;
  const pauses = useMemo(() => estimateDay(settings, toDateKey(clock.now())).pauses, [settings]);
  const equipment = equipmentIn(settings.equipment);
  const times: { icon: IconName; label: string; value: string }[] = [
    { icon: 'sunrise', label: t('settings.start'), value: schedule.workStart },
    { icon: 'sunset', label: t('settings.end'), value: schedule.workEnd },
    {
      icon: 'mug',
      label: t('settings.break'),
      value: schedule.breaks[0]?.start ?? t('settings.none'),
    },
    {
      icon: 'food',
      label: t('settings.lunch'),
      value: schedule.lunch?.start ?? t('settings.none'),
    },
  ];

  return (
    <>
      <ScreenHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Card as="section" className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            <PixelIcon name="clock" size={24} />
            {t('settings.workday')}
          </h2>
          <Link
            to={settingsPath('schedule')}
            className={styles.edit}
            aria-label={t('settings.edit', { section: t('settings.workday') })}
          >
            <LineIcon name="chevron-right" size={20} />
          </Link>
        </div>
        <div className={styles.times}>
          {times.map((item) => (
            <div key={item.label} className={styles.time}>
              <PixelIcon name={item.icon} size={24} />
              <span className={styles.timeTexts}>
                <span className={styles.timeLabel}>{item.label}</span>
                <span className={styles.timeValue}>{item.value}</span>
              </span>
            </div>
          ))}
        </div>
        <p className={styles.muted}>
          {settings.workDays.map((day) => weekdayName(locale, day, 'short')).join(' · ')}
        </p>
      </Card>

      <Card as="section" className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            <PixelIcon name="neck" size={24} />
            {t('settings.discomfort')}
          </h2>
          <Link
            to={settingsPath('discomfort')}
            className={styles.edit}
            aria-label={t('settings.edit', { section: t('settings.discomfort') })}
          >
            <LineIcon name="chevron-right" size={20} />
          </Link>
        </div>
        <PriorityTags
          discomfort={settings.discomfort}
          empty={t('onboarding.summary.noPriorities')}
        />
      </Card>

      <Card as="section" className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            <PixelIcon name="dumbbell" size={24} />
            {t('settings.equipment')}
          </h2>
          <Link
            to={settingsPath('equipment')}
            className={styles.edit}
            aria-label={t('settings.edit', { section: t('settings.equipment') })}
          >
            <LineIcon name="chevron-right" size={20} />
          </Link>
        </div>
        {equipment.length > 0 ? (
          <ul className={styles.gear}>
            {equipment.map((item) => (
              <li key={item.id} className={styles.gearItem}>
                <PixelIcon name={equipmentIcon(item.id)} size={32} />
                <span>{item.name[locale]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>{t('settings.noEquipment')}</p>
        )}
      </Card>

      <ListRow
        leading={<PixelIcon name="progress" size={32} />}
        title={t('settings.intensity')}
        subtitle={t('settings.intensityValue', {
          intensity: t(`intensity.${settings.intensity}`),
          pauses: t('common.pauses', { count: pauses }),
        })}
        to={settingsPath('intensity')}
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
