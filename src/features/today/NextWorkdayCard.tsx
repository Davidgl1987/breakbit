import { useState } from 'react';
import { nextWorkday, resolveDaySchedule } from '@/domain/calendar/schedule';
import { addDays } from '@/domain/time';
import type { DateKey } from '@/domain/types';
import { ScheduleSheet } from '@/features/day/ScheduleSheet';
import { formatLongDate } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './TodayScreen.module.css';

export function NextWorkdayCard({ date }: { date: DateKey }) {
  const { t, locale } = useT();
  const settings = useAppStore((state) => state.settings);
  const overrides = useAppStore((state) => state.dayOverrides);
  const setCustomSchedule = useAppStore((state) => state.setCustomSchedule);
  const skipUntil = useAppStore((state) => state.skipUntil);
  const [editing, setEditing] = useState(false);
  const next = nextWorkday(date, settings, overrides);
  const schedule = next && resolveDaySchedule(next, settings, overrides);
  if (!next || !schedule) return null;
  return (
    <>
      <section className={styles.nextWorkday}>
        <div className={styles.sectionHead}>
          <h3 className={styles.cardTitle}>{t('cycle.next.title')}</h3>
          <button className={styles.actionLink} onClick={() => setEditing(true)}>
            {t('common.edit')} <LineIcon name="chevron-right" size={18} />
          </button>
        </div>
        <p className={styles.nextDate}>{formatLongDate(locale, next)}</p>
        <p className={styles.small}>
          {schedule.workStart}–{schedule.workEnd}
        </p>
      </section>
      {editing && (
        <ScheduleSheet
          title={t('cycle.next.edit')}
          initial={schedule}
          calendar={{
            initial: next,
            min: addDays(date, 1),
            max: addDays(date, 366),
          }}
          onClose={() => setEditing(false)}
          onSave={(hours, selectedDate) => {
            if (!selectedDate) return;
            // Postponing the next workday also marks the intervening workdays as days off.
            if (selectedDate > next) skipUntil(next, selectedDate, hours);
            else setCustomSchedule(selectedDate, hours);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}
