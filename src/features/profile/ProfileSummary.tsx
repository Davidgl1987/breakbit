import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router';
import { equipmentIn } from '@/content/catalog';
import { toDateKey } from '@/domain/time';
import type { TimeBlock, UserSettings } from '@/domain/types';
import { equipmentIcon } from '@/features/day/catalogDisplay';
import { estimateDay } from '@/features/onboarding/estimate';
import { rangeFromBlock } from '@/features/schedule/timeRange';
import { weekdayName } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { Card } from '@/ui/components/Card/Card';
import { Tag } from '@/ui/components/Tag/Tag';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { PACE_ICONS } from './pace';
import { PriorityTags } from './PriorityTags';
import styles from './ProfileSummary.module.css';

/**
 * The user's setup at a glance — workday, discomfort, equipment and pace — the same in the
 * onboarding summary and in Settings. Each part says where to edit it (`editTo`).
 */

interface SummaryProps {
  title: string;
  /** Where "Editar" leads. */
  editTo: string;
}

export function WorkdaySummary({
  title,
  editTo,
  workDays,
  schedule,
}: SummaryProps & Pick<UserSettings, 'workDays' | 'schedule'>) {
  const { t, locale } = useT();
  const range = (
    key: 'onboarding.summary.breakRange' | 'onboarding.summary.lunchRange',
    block: TimeBlock,
  ) => t(key, { ...rangeFromBlock(block) });
  return (
    <Card as="section" className={styles.card}>
      <SectionHeader title={title} editTo={editTo} />
      <div className={styles.stack}>
        <p className={styles.days}>
          {workDays.map((day) => weekdayName(locale, day, 'short')).join(' · ')}
        </p>
        <p className={styles.big}>
          {schedule.workStart}–{schedule.workEnd}
        </p>
      </div>
      <ul className={styles.rows}>
        <Row icon="mug">
          {schedule.breaks[0]
            ? range('onboarding.summary.breakRange', schedule.breaks[0])
            : t('onboarding.summary.noBreak')}
        </Row>
        <Row icon="food">
          {schedule.lunch
            ? range('onboarding.summary.lunchRange', schedule.lunch)
            : t('onboarding.summary.noLunch')}
        </Row>
      </ul>
    </Card>
  );
}

export function PrioritiesSummary({
  title,
  editTo,
  discomfort,
}: SummaryProps & Pick<UserSettings, 'discomfort'>) {
  const { t } = useT();
  return (
    <section className={styles.flat}>
      <SectionHeader title={title} editTo={editTo} />
      <PriorityTags discomfort={discomfort} empty={t('onboarding.summary.noPriorities')} />
    </section>
  );
}

export function EquipmentSummary({
  title,
  editTo,
  equipment,
}: SummaryProps & Pick<UserSettings, 'equipment'>) {
  const { t, locale } = useT();
  const items = equipmentIn(equipment);
  return (
    <section className={styles.flat}>
      <SectionHeader title={title} editTo={editTo} />
      {items.length > 0 ? (
        <ul className={styles.tags}>
          {items.map((item) => (
            <li key={item.id}>
              <Tag icon={equipmentIcon(item.id)}>{item.name[locale]}</Tag>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.muted}>{t('onboarding.summary.noEquipment')}</p>
      )}
    </section>
  );
}

/** Pace, and what it means for the usual workday. */
export function PaceSummary({
  title,
  editTo,
  settings,
}: SummaryProps & { settings: UserSettings }) {
  const { t } = useT();
  const estimate = useMemo(() => estimateDay(settings, toDateKey(clock.now())), [settings]);
  return (
    <Card as="section" variant="tinted" className={styles.card}>
      <SectionHeader title={title} editTo={editTo} />
      <div className={styles.pace}>
        <PixelIcon name={PACE_ICONS[settings.intensity]} size={48} />
        <div className={styles.stack}>
          <p className={styles.big}>
            {t('onboarding.summary.paceValue', {
              intensity: t(`intensity.${settings.intensity}`),
              pauses: t('common.pausesPlanned', { count: estimate.pauses }),
              minutes: t('common.minutes', { count: estimate.interruptionMin }),
            })}
          </p>
          <p className={styles.muted}>{t('onboarding.summary.paceHint')}</p>
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({ title, editTo }: SummaryProps) {
  const { t } = useT();
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <Link
        to={editTo}
        aria-label={t('common.editSection', { section: title })}
        className={styles.edit}
      >
        {t('common.edit')}
      </Link>
    </div>
  );
}

function Row({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <li className={styles.row}>
      <PixelIcon name={icon} size={24} />
      {children}
    </li>
  );
}
