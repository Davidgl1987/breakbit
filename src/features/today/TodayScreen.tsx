import { ROUTES } from '@/app/routes';
import { useToday } from '@/features/day/useToday';
import { formatLongDate } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { selectXpOn, useLevel, useStreak } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import { AvatarCard } from '@/ui/game/AvatarCard/AvatarCard';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { ActiveDay } from './ActiveDay';
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
        <div className={styles.greeting}>
          <h1 className={styles.title}>{t('today.greeting')}</h1>
          <p className={styles.subtitle}>{formatLongDate(locale, date)}</p>
        </div>
      </header>

      <AvatarCard phase={phase} streak={streak} xpToday={xpToday} level={level} />

      {state.kind === 'active' && <ActiveDay plan={state.plan} over={state.over} now={now} />}
      {state.kind === 'not_started' && (
        <NotStartedCard date={date} schedule={state.schedule} late={state.late} now={now} />
      )}
      {state.kind === 'rest' && <RestCard date={date} />}
      {state.kind === 'day_off' && <DayOffCard date={date} />}
      {state.kind === 'closed' && <RestCard date={date} closed />}

      {import.meta.env.DEV && (
        <div className={styles.devLinks}>
          <ListRow
            leading={<PixelIcon name="edit" size={24} />}
            title={t('kit.title')}
            subtitle={t('kit.subtitle')}
            to={ROUTES.devKit}
          />
          <ListRow
            leading={<PixelIcon name="moon" size={24} />}
            title={t('dayEnd.title')}
            subtitle={t('dayEnd.subtitle')}
            to={ROUTES.dayEnd}
          />
        </div>
      )}
    </>
  );
}
