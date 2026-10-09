import { useToday } from '@/features/day/useToday';
import { WeekResultCard } from '@/features/week/WeekResultCard';
import { formatLongDate } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { selectXpOn, useLevel, useStreak } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import { AvatarCard } from '@/ui/game/AvatarCard/AvatarCard';
import { ActiveDay } from './ActiveDay';
import { DayClock } from './DayClock';
import { DayOffCard, NotStartedCard, RestCard } from './DayStateCards';
import styles from './TodayScreen.module.css';

/** "/" — how today is going: avatar and progress, then the day itself. */
export function TodayScreen() {
  const { t, locale } = useT();
  const { now, date, state } = useToday();
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const xpToday = useAppStore(selectXpOn(date));
  const level = useLevel();
  const streak = useStreak(date);

  return (
    <>
      <header className={styles.header}>
        <Wordmark />
        <div className={styles.greetingRow}>
          <div className={styles.greeting}>
            <h1 className={styles.title}>{t('redesign.heading')}</h1>
            <p className={styles.subtitle}>{formatLongDate(locale, date)}</p>
          </div>
          {state.kind === 'active' && <DayClock plan={state.plan} now={now} />}
        </div>
      </header>

      {state.kind !== 'active' && (
        <AvatarCard phase={phase} streak={streak} xpToday={xpToday} level={level} />
      )}
      <WeekResultCard />

      {state.kind === 'active' && <ActiveDay plan={state.plan} over={state.over} now={now} />}
      {state.kind === 'not_started' && (
        <NotStartedCard date={date} schedule={state.schedule} late={state.late} now={now} />
      )}
      {state.kind === 'rest' && <RestCard date={date} />}
      {state.kind === 'day_off' && <DayOffCard date={date} />}
      {state.kind === 'closed' && <RestCard date={date} closed />}
    </>
  );
}
