import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { mainPath, pausePlayPath, ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { nextWorkday, resolveDaySchedule } from '@/domain/calendar/schedule';
import { GOALS } from '@/domain/config';
import { dayGoalXp, summarizeDay } from '@/domain/day/closeDay';
import { dayProgress } from '@/domain/day/progress';
import { recoverablePause, recoveryMakesGood } from '@/domain/day/recovery';
import { mainActivityOf, workEnd } from '@/domain/day/today';
import { isOpen } from '@/domain/pause/window';
import { addDays, weekdayOf } from '@/domain/time';
import type { DateKey, DayPlan, DaySchedule, Instant, Mood, NextDayDecision } from '@/domain/types';
import { mainActivityInfo } from '@/features/day/mainActivity';
import { useToday } from '@/features/day/useToday';
import { DaySceneCard } from '@/features/day/DaySceneCard';
import { DayFacts } from '@/features/day/DayFacts';
import { ScheduleSheet } from '@/features/day/ScheduleSheet';
import { formatActiveTime, formatDuration, formatLongDate, weekdayName } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { selectXpOn, useStreak } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { showToast } from '@/state/toasts';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { ChipGroup } from '@/ui/components/ChipGroup/ChipGroup';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import styles from './DayEndScreen.module.css';

const MOODS: Mood[] = ['great', 'good', 'loaded', 'bad'];

/**
 * /day/end — "Fin de jornada": how the day went, one last pause to recover, how the user
 * ends it and what the next workday looks like. Full screen, without the tab bar.
 */
export function DayEndScreen() {
  const { now, date, state } = useToday();
  if (state.kind !== 'active') return <Navigate to={ROUTES.today} replace />;
  return <DayEnd plan={state.plan} date={date} now={now} />;
}

function DayEnd({ plan, date, now }: { plan: DayPlan; date: DateKey; now: Instant }) {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const record = useAppStore((state) => state.days[date]);
  const settings = useAppStore((state) => state.settings);
  const dayOverrides = useAppStore((state) => state.dayOverrides);
  const xpSoFar = useAppStore(selectXpOn(date));
  const closeDay = useAppStore((state) => state.closeDay);
  const recoverPause = useAppStore((state) => state.recoverPause);
  const shortenMain = useAppStore((state) => state.shortenMain);
  const repeatSchedule = useAppStore((state) => state.repeatSchedule);
  const setCustomSchedule = useAppStore((state) => state.setCustomSchedule);
  const skipUntil = useAppStore((state) => state.skipUntil);
  const streak = useStreak(date);

  const progress = dayProgress(plan, CATALOG);
  // Earned when the day closes: shown already, so the day reads as a whole.
  const goalXp = dayGoalXp(date, progress, now);
  const xp = xpSoFar + goalXp.reduce((sum, entry) => sum + entry.amount, 0);
  const summary = summarizeDay(plan, CATALOG, xp);
  const verdict =
    progress.isPerfect && progress.isGood ? 'perfect' : progress.isGood ? 'good' : 'other';
  const recoverable = record && recoverablePause(record);
  const main = mainActivityOf(plan);
  const mainInfo = main && mainActivityInfo(main);
  const mainOpen = main !== undefined && isOpen(main);
  const pendingPauses = plan.activities.filter(
    (item) =>
      item.kind === 'micro' &&
      item.origin !== 'gap' &&
      isOpen(item) &&
      item.startedAt === undefined,
  ).length;
  const minPercent = Math.round(GOALS.goodDayMinRatio * 100);
  const missingPauses = Math.max(
    0,
    Math.ceil((progress.planned * minPercent) / 100) - progress.completed,
  );

  // The next workday and its answer, applied only on "Cerrar jornada".
  const nextDate = nextWorkday(date, settings, dayOverrides);
  const [mood, setMood] = useState<Mood | ''>('');
  const [next, setNext] = useState<NextDayDecision | ''>('');
  const [hours, setHours] = useState<DaySchedule>(
    () => (nextDate && resolveDaySchedule(nextDate, settings, dayOverrides)) || plan.schedule,
  );
  const [editingHours, setEditingHours] = useState(false);
  const backOptions = nextDate ? Array.from({ length: 7 }, (_, i) => addDays(nextDate, i + 1)) : [];
  const usualBack = nextDate && nextWorkday(nextDate, settings, dayOverrides);
  const [backOn, setBackOn] = useState<DateKey | ''>(
    usualBack && backOptions.includes(usualBack) ? usualBack : (backOptions[0] ?? ''),
  );
  const dayName = (day: DateKey, width: 'short' | 'long' = 'long') =>
    weekdayName(locale, weekdayOf(day), width);

  const [confirmingEarly, setConfirmingEarly] = useState(false);
  const minutesLeft = Math.ceil((workEnd(plan) - now) / 60_000);
  const close = () =>
    runScreenTransition(() => {
      if (nextDate && next === 'repeat') repeatSchedule(nextDate, plan.schedule);
      if (nextDate && next === 'change') setCustomSchedule(nextDate, hours);
      if (nextDate && next === 'day_off' && backOn) skipUntil(nextDate, backOn);
      closeDay(date, { mood: mood || undefined, nextDay: next || undefined });
      navigate(ROUTES.today, { replace: true });
      showToast(t('dayEnd.closed'), 'success');
    });

  return (
    <FlowLayout
      top={
        <IconButton label={t('common.close')} to={ROUTES.today}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={
        <header className={styles.header}>
          <h1 className={styles.title}>{t('cycle.end.title')}</h1>
          <p className={styles.muted}>{formatLongDate(locale, date)}</p>
        </header>
      }
      footer={
        <Button
          size="lg"
          fullWidth
          // Before the end of the workday, say what's left first.
          onClick={() => (minutesLeft > 0 ? setConfirmingEarly(true) : close())}
        >
          {t('dayEnd.close')}
        </Button>
      }
    >
      <DaySceneCard
        kicker={t('cycle.end.kicker')}
        title={t('cycle.end.movement', { time: formatActiveTime(summary.movementSec) })}
        pose={summary.movementSec > 0 ? 'celebrate' : 'idle'}
        footer={
          xp > 0 && (
            <div className={styles.xpRow}>
              <strong className={styles.xp}>
                <PixelIcon name="xp" size={24} />
                {t('dayEnd.xp', { xp })}
              </strong>
              <span className={styles.small}>{t('cycle.end.xpNote')}</span>
            </div>
          )
        }
      >
        <p>{t('cycle.end.interruption', { time: formatActiveTime(summary.interruptionSec) })}</p>
        {verdict !== 'other' && <p>{t(`dayEnd.verdict.${verdict}.title`)}</p>}
      </DaySceneCard>
      <div className={styles.stats}>
        <div>
          <strong>
            {summary.completed}/{summary.planned}
          </strong>
          <span>{t('cycle.closed.pauses')}</span>
        </div>
        <div>
          <strong>{formatActiveTime(summary.interruptionSec)}</strong>
          <span>{t('dayEnd.stats.interruption')}</span>
        </div>
      </div>
      <details className={styles.details}>
        <summary>{t('cycle.end.details')}</summary>
        <DayFacts summary={summary} hasMain={progress.hasMain} />
        <div className={styles.goal}>
          <PixelIcon name={progress.isGood ? 'reward' : 'goal'} size={32} />
          <div className={styles.goalTexts}>
            <strong>{progress.isGood ? t('dayEnd.goal.done') : t('dayEnd.goal.pending')}</strong>
            {progress.isGood ? (
              <span className={styles.small}>{t('dayEnd.goal.streak', { count: streak })}</span>
            ) : (
              <>
                {missingPauses > 0 && (
                  <span className={styles.small}>
                    {t('dayEnd.goal.missingPauses', { count: missingPauses })}
                  </span>
                )}
                {progress.hasMain && !progress.mainCompleted && (
                  <span className={styles.small}>{t('dayEnd.goal.missingMain')}</span>
                )}
              </>
            )}
          </div>
        </div>
        {goalXp.map((entry) => (
          <p key={entry.reason} className={styles.small}>
            {t(entry.reason === 'good_day' ? 'dayEnd.goodXp' : 'dayEnd.perfectXp', {
              xp: entry.amount,
            })}
          </p>
        ))}
      </details>

      {recoverable && record && (
        <section className={styles.recovery}>
          <div>
            <h2 className={styles.actionTitle}>{t('dayEnd.recovery.title')}</h2>
            <p className={styles.small}>
              {recoveryMakesGood(record, CATALOG)
                ? t('dayEnd.recovery.bodyGood')
                : t('dayEnd.recovery.body')}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() =>
              runScreenTransition(() => {
                const id = recoverPause(date);
                if (id) navigate(pausePlayPath(id));
              })
            }
          >
            {t('dayEnd.recovery.action')}
          </Button>
        </section>
      )}

      {mainOpen && main && mainInfo && (
        <Card as="section" className={styles.action}>
          <h2 className={styles.actionTitle}>{t('dayEnd.main.title')}</h2>
          <p className={styles.small}>{t('dayEnd.main.body', { name: mainInfo.name[locale] })}</p>
          <div className={styles.buttons}>
            <Button variant="secondary" onClick={() => navigate(mainPath(main.id))}>
              {main.startedAt === undefined ? t('dayEnd.main.go') : t('dayEnd.main.resume')}
            </Button>
            {main.startedAt === undefined &&
              mainInfo.shortVersionMin !== undefined &&
              mainInfo.shortVersionMin * 60 < main.durationSec && (
                <Button
                  variant="ghost"
                  onClick={() =>
                    runScreenTransition(() => {
                      shortenMain(date, main.id);
                      navigate(mainPath(main.id));
                    })
                  }
                >
                  {t('dayEnd.main.short', {
                    minutes: t('common.minutes', {
                      count: mainInfo.shortVersionMin,
                    }),
                  })}
                </Button>
              )}
          </div>
        </Card>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dayEnd.mood.title')}</h2>
        <ChipGroup<Mood | ''>
          label={t('dayEnd.mood.title')}
          layout="grid"
          fill
          value={mood}
          onChange={setMood}
          options={MOODS.map((value) => ({
            value,
            label: t(`dayEnd.mood.${value}`),
            icon: `mood_${value}`,
          }))}
        />
        <p className={styles.small}>{t('dayEnd.mood.hint')}</p>
      </section>

      {nextDate && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {nextDate === addDays(date, 1)
              ? t('dayEnd.next.tomorrow')
              : t('dayEnd.next.on', { day: dayName(nextDate) })}
          </h2>
          <p className={styles.small}>
            {formatLongDate(locale, nextDate)} ·{' '}
            {next === 'repeat' ? plan.schedule.workStart : hours.workStart}–
            {next === 'repeat' ? plan.schedule.workEnd : hours.workEnd}
          </p>
          <ChipGroup<NextDayDecision | ''>
            label={t('dayEnd.next.label')}
            layout="list"
            fill
            value={next}
            onChange={(value) => {
              setNext(value);
              if (value === 'change') setEditingHours(true);
            }}
            options={[
              { value: 'repeat', label: t('cycle.end.repeat') },
              { value: 'change', label: t('cycle.end.change') },
              { value: 'day_off', label: t('dayEnd.next.dayOff') },
            ]}
          />
          {next === 'change' && (
            <Button variant="ghost" onClick={() => setEditingHours(true)}>
              {t('dayEnd.next.hours', {
                day: dayName(nextDate),
                start: hours.workStart,
                end: hours.workEnd,
              })}
            </Button>
          )}
          {next === 'day_off' && backOn && (
            <ChipGroup<DateKey | ''>
              label={t('dayEnd.next.back')}
              showLabel
              value={backOn}
              onChange={setBackOn}
              options={backOptions.map((day) => ({
                value: day,
                label: `${dayName(day, 'short')} ${Number(day.slice(8))}`,
              }))}
            />
          )}
        </section>
      )}

      {confirmingEarly && (
        <BottomSheet
          open
          onClose={() => setConfirmingEarly(false)}
          title={t('dayEnd.early.title')}
          actions={
            <>
              <Button variant="secondary" fullWidth onClick={() => setConfirmingEarly(false)}>
                {t('dayEnd.early.cancel')}
              </Button>
              <button className={styles.earlyClose} onClick={close}>
                {t('dayEnd.early.confirm')} <LineIcon name="chevron-right" size={18} />
              </button>
            </>
          }
        >
          <div className={styles.sheetBody}>
            <p>
              {t('dayEnd.early.timeLeft', {
                time: formatDuration(minutesLeft),
              })}
            </p>
            {pendingPauses > 0 && <p>{t('dayEnd.early.pauses', { count: pendingPauses })}</p>}
            {mainOpen && <p>{t('dayEnd.early.main')}</p>}
            {(pendingPauses > 0 || mainOpen) && (
              <p className={styles.small}>{t('dayEnd.early.note')}</p>
            )}
          </div>
        </BottomSheet>
      )}

      {editingHours && nextDate && (
        <ScheduleSheet
          title={t('dayEnd.next.changeTitle', { day: dayName(nextDate) })}
          initial={hours}
          onClose={() => setEditingHours(false)}
          onSave={(schedule) => {
            setHours(schedule);
            setEditingHours(false);
          }}
        />
      )}
    </FlowLayout>
  );
}
