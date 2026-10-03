import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { nextWorkday, resolveDaySchedule } from '@/domain/calendar/schedule';
import { summarizePlan } from '@/domain/planner/summary';
import { weekdayOf } from '@/domain/time';
import type { DateKey, DaySchedule, Instant } from '@/domain/types';
import { DayOffSheet } from '@/features/day/DayOffSheet';
import { useDayPlanner } from '@/features/day/useDayPlanner';
import { weekdayName } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './TodayScreen.module.css';

interface NotStartedCardProps {
  date: DateKey;
  schedule: DaySchedule;
  late: boolean;
  now: Instant;
}

/** A workday not planned yet: what it would look like, and "Empezar jornada". */
export function NotStartedCard({ date, schedule, late, now }: NotStartedCardProps) {
  const { t } = useT();
  const planner = useDayPlanner();
  const markDayOff = useAppStore((state) => state.markDayOff);
  const [confirmDayOff, setConfirmDayOff] = useState(false);
  const summary = useMemo(
    () => summarizePlan(planner.plan({ date, schedule, meetings: [], now }), CATALOG),
    [planner, date, schedule, now],
  );

  return (
    <>
      <Card as="section" variant={late ? 'standard' : 'tinted'} className={styles.stateCard}>
        <PixelIcon name={late ? 'moon' : 'sun'} size={48} />
        <div className={styles.stateTexts}>
          <h2 className={styles.stateTitle}>
            {late ? t('today.states.late') : t('today.states.notStarted')}
          </h2>
          <p className={styles.muted}>
            {late
              ? t('today.states.lateBody')
              : t('today.states.notStartedBody', {
                  start: schedule.workStart,
                  end: schedule.workEnd,
                  pauses: t('common.pausesPlanned', { count: summary.microCount }),
                  minutes: t('common.minutes', {
                    count: Math.round(summary.interruptionSec / 60),
                  }),
                })}
          </p>
        </div>
        <Link
          to={ROUTES.dayStart}
          className={buttonClassName({
            variant: late ? 'secondary' : 'primary',
            size: 'lg',
            fullWidth: true,
          })}
        >
          {late ? t('today.states.adjustHours') : t('today.states.startDay')}
        </Link>
      </Card>
      {!late && (
        <Button variant="ghost" onClick={() => setConfirmDayOff(true)}>
          {t('today.dayOff')}
        </Button>
      )}
      {confirmDayOff && (
        <DayOffSheet
          onClose={() => setConfirmDayOff(false)}
          onConfirm={() => {
            markDayOff(date);
            setConfirmDayOff(false);
          }}
        />
      )}
    </>
  );
}

/** Not a workday (or the day is already closed): when the next one is. */
export function RestCard({ date, closed = false }: { date: DateKey; closed?: boolean }) {
  const { t } = useT();
  return (
    <Card as="section" className={styles.stateCard}>
      <PixelIcon name={closed ? 'success' : 'sofa'} size={48} />
      <div className={styles.stateTexts}>
        <h2 className={styles.stateTitle}>
          {closed ? t('today.states.closed') : t('today.states.rest')}
        </h2>
        <NextWorkday date={date} />
      </div>
      {!closed && (
        <Link
          to={ROUTES.dayStart}
          className={buttonClassName({ variant: 'secondary', fullWidth: true })}
        >
          {t('today.states.workToday')}
        </Link>
      )}
    </Card>
  );
}

/** "Hoy no trabajo": nothing planned, and the way back. */
export function DayOffCard({ date }: { date: DateKey }) {
  const { t } = useT();
  const undoDayOff = useAppStore((state) => state.undoDayOff);
  return (
    <Card as="section" className={styles.stateCard}>
      <PixelIcon name="rest" size={48} />
      <div className={styles.stateTexts}>
        <h2 className={styles.stateTitle}>{t('today.states.dayOff')}</h2>
        <p className={styles.muted}>{t('today.states.dayOffBody')}</p>
        <NextWorkday date={date} />
      </div>
      <Button variant="secondary" fullWidth onClick={() => undoDayOff(date)}>
        {t('today.states.undoDayOff')}
      </Button>
    </Card>
  );
}

function NextWorkday({ date }: { date: DateKey }) {
  const { t, locale } = useT();
  const settings = useAppStore((state) => state.settings);
  const overrides = useAppStore((state) => state.dayOverrides);
  const next = nextWorkday(date, settings, overrides);
  const schedule = next && resolveDaySchedule(next, settings, overrides);
  if (!next || !schedule) return null;
  return (
    <p className={styles.muted}>
      {t('today.states.nextWorkday', {
        day: weekdayName(locale, weekdayOf(next)),
        time: schedule.workStart,
      })}
    </p>
  );
}
