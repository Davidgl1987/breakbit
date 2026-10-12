import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { summarizePlan } from '@/domain/planner/summary';
import type { DateKey, DaySchedule, Instant } from '@/domain/types';
import { DayFacts } from '@/features/day/DayFacts';
import { DayOffSheet } from '@/features/day/DayOffSheet';
import { DaySceneCard } from '@/features/day/DaySceneCard';
import { useDayPlanner } from '@/features/day/useDayPlanner';
import { mainActivityOf } from '@/domain/day/today';
import { mainActivityInfo } from '@/features/day/mainActivity';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { formatActiveTime } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { LineIcon } from '@/ui/icons/LineIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import { LevelStrip } from './LevelStrip';
import { NextWorkdayCard } from './NextWorkdayCard';
import styles from './TodayScreen.module.css';

export function NotStartedCard({
  date,
  schedule,
  late,
  now,
}: {
  date: DateKey;
  schedule: DaySchedule;
  late: boolean;
  now: Instant;
}) {
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
      <DaySceneCard
        pose={late ? 'idle' : 'sleep'}
        kicker={t(late ? 'cycle.late.kicker' : 'cycle.before.kicker')}
        title={t(late ? 'cycle.late.title' : 'cycle.before.title')}
        footer={
          <Link
            to={ROUTES.dayStart}
            className={buttonClassName({
              variant: late ? 'secondary' : 'primary',
              size: 'lg',
              fullWidth: true,
            })}
          >
            {t(late ? 'today.states.adjustHours' : 'cycle.before.prepare')}
          </Link>
        }
      >
        <p>{late ? t('today.states.lateBody') : t('cycle.before.body')}</p>
        <strong>
          {schedule.workStart}–{schedule.workEnd}
        </strong>
      </DaySceneCard>
      {!late && (
        <div className={styles.cycleStats}>
          <div>
            <strong>{summary.microCount}</strong>
            <span>{t('dayStart.pauses', { count: summary.microCount })}</span>
          </div>
          <div>
            <strong>~{formatActiveTime(summary.interruptionSec)}</strong>
            <span>{t('dayStart.interruption')}</span>
          </div>
        </div>
      )}
      {late && <NextWorkdayCard date={date} />}
      <LevelStrip />
      <button className={styles.dangerLink} onClick={() => setConfirmDayOff(true)}>
        {t('today.dayOff')} <LineIcon name="chevron-right" size={18} />
      </button>
      {confirmDayOff && (
        <DayOffSheet
          onClose={() => setConfirmDayOff(false)}
          onConfirm={() =>
            runScreenTransition(() => {
              markDayOff(date);
              setConfirmDayOff(false);
            })
          }
        />
      )}
    </>
  );
}

export function RestCard({ date, closed = false }: { date: DateKey; closed?: boolean }) {
  const { t, locale } = useT();
  const record = useAppStore((state) => (closed ? state.days[date] : undefined));
  const summary = record?.summary;
  const main = record?.plan && mainActivityOf(record.plan);
  const activity = main && mainActivityInfo(main);
  return (
    <>
      <DaySceneCard
        pose={closed ? 'celebrate' : 'rest'}
        kicker={t(closed ? 'cycle.closed.kicker' : 'cycle.rest.kicker')}
        title={t(closed ? 'cycle.closed.title' : 'cycle.rest.title')}
        footer={
          closed ? (
            <Link to={ROUTES.progress} className={buttonClassName({ fullWidth: true })}>
              {t('cycle.progress')}
            </Link>
          ) : (
            <Link
              to={ROUTES.dayStart}
              className={buttonClassName({
                variant: 'secondary',
                fullWidth: true,
              })}
            >
              {t('today.states.workToday')}
            </Link>
          )
        }
      >
        <p>
          {summary
            ? t('cycle.closed.summary', {
                movement: formatActiveTime(summary.movementSec),
                interruption: formatActiveTime(summary.interruptionSec),
              })
            : t('cycle.rest.body')}
        </p>
      </DaySceneCard>
      {summary && (
        <div className={styles.cycleStats}>
          <div>
            <strong>
              {summary.completed}/{summary.planned}
            </strong>
            <span>{t('cycle.closed.pauses')}</span>
          </div>
          <div>
            <strong>
              {summary.xp > 0 ? t('dayEnd.xp', { xp: summary.xp }) : `${summary.xp} XP`}
            </strong>
            <span>{t('cycle.end.xpNote')}</span>
          </div>
        </div>
      )}
      {summary?.mainCompleted && main && activity && (
        <div className={styles.completedActivity}>
          <PixelIcon name="completed" size={32} />
          <div>
            <strong>{activity.name[locale]}</strong>
            <span className={styles.small}>
              {t('today.mainCompleted')} · {t('common.minutes', { count: main.durationSec / 60 })}
            </span>
          </div>
        </div>
      )}
      <NextWorkdayCard date={date} />
      <LevelStrip showLink={!closed} />
      {summary && (
        <details className={styles.cycleDetails}>
          <summary>{t('cycle.closed.details')}</summary>
          <DayFacts
            summary={summary}
            hasMain={record?.plan?.activities.some((item) => item.kind === 'main')}
          />
        </details>
      )}
    </>
  );
}

export function DayOffCard({ date }: { date: DateKey }) {
  const { t } = useT();
  const undoDayOff = useAppStore((state) => state.undoDayOff);
  return (
    <>
      <DaySceneCard
        pose="rest"
        kicker={t('today.states.dayOff')}
        title={t('cycle.off.title')}
        footer={
          <Button variant="secondary" fullWidth onClick={() => undoDayOff(date)}>
            {t('today.states.undoDayOff')}
          </Button>
        }
      >
        <p>{t('today.states.dayOffBody')}</p>
      </DaySceneCard>
      <NextWorkdayCard date={date} />
      <LevelStrip />
    </>
  );
}
