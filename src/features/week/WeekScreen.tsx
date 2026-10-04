import { Navigate, useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/app/routes';
import { ROOM_ITEMS } from '@/content/roomItems';
import { WEEK } from '@/domain/config';
import { goodWeekStreak } from '@/domain/progress/weekly';
import type { WeeklyResult } from '@/domain/types';
import { useT, type Translate } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { Celebration } from '@/ui/game/Celebration/Celebration';
import { EvolutionStrip } from '@/ui/game/EvolutionStrip/EvolutionStrip';
import { RoomScene } from '@/ui/game/RoomScene/RoomScene';
import { roomItemIcon } from '@/ui/icons/domainIcons';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import styles from './WeekScreen.module.css';

/**
 * /week/:week — how a week went and what it did to the avatar: up a phase, the same, or
 * down one (never below the first), and at the top, a new item for the room. Shown once.
 */
export function WeekScreen() {
  const { week = '' } = useParams();
  const results = useAppStore((state) => state.progress.weeklyResults);
  const index = results.findIndex((item) => item.week === week);
  if (index < 0) return <Navigate to={ROUTES.today} replace />;
  return <Week result={results[index]!} streak={goodWeekStreak(results.slice(0, index + 1))} />;
}

function Week({ result, streak }: { result: WeeklyResult; streak: number }) {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const markWeekSeen = useAppStore((state) => state.markWeekSeen);
  const unlockedIds = useAppStore((state) => state.progress.unlockedRoomItems);
  const good = result.result === 'good';
  const roomItems = ROOM_ITEMS.filter((item) => unlockedIds.includes(item.id)).map((item) => ({
    id: item.id,
    name: item.name[locale],
    icon: roomItemIcon(item.id),
  }));
  const unlocked = ROOM_ITEMS.find((item) => item.id === result.unlocked);

  return (
    <FlowLayout
      // Closing keeps the result on Today until "Seguir".
      top={
        <IconButton label={t('common.close')} to={ROUTES.today}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={
        <header className={styles.header}>
          <p className={styles.label}>{t('week.label')}</p>
          <h1 className={styles.title}>{t(`week.results.${result.result}.title`)}</h1>
        </header>
      }
      footer={
        <Button
          size="lg"
          fullWidth
          onClick={() =>
            runScreenTransition(() => {
              markWeekSeen(result.week);
              navigate(ROUTES.today, { replace: true });
            })
          }
        >
          {t('week.continue')}
        </Button>
      }
    >
      <AvatarStage
        phase={result.phaseAfter}
        pose={good ? 'celebrate' : 'idle'}
        label={t('week.stage')}
      >
        {/* A new phase, or a new item for the room. */}
        {(result.phaseAfter > result.phaseBefore || result.unlocked) && <Celebration />}
      </AvatarStage>

      <Card as="section" className={styles.summary}>
        {result.result !== 'neutral' && (
          <p className={styles.tally}>
            {t('week.tally', { good: result.good, planned: result.planned })}
          </p>
        )}
        <p className={styles.muted}>{phaseMessage(result, t)}</p>
        {streak >= 2 && (
          <p className={styles.streak}>
            <PixelIcon name="streak" size={24} />
            {t('week.streak', { count: streak })}
          </p>
        )}
      </Card>

      <EvolutionStrip current={result.phaseAfter} />

      {unlocked && (
        <Card as="section" variant="tinted" className={styles.room}>
          <h2 className={styles.roomTitle}>
            {t('week.unlocked', { item: unlocked.name[locale] })}
          </h2>
          <RoomScene
            label={t('week.room')}
            items={roomItems}
            capacity={ROOM_ITEMS.length}
            highlight={unlocked.id}
            newLabel={t('week.new')}
          />
        </Card>
      )}
    </FlowLayout>
  );
}

/** What the week did to the avatar, said plainly. */
function phaseMessage(result: WeeklyResult, t: Translate): string {
  const phase = t(`evolution.phases.p${result.phaseAfter}`);
  switch (result.result) {
    case 'good':
      return result.phaseAfter > result.phaseBefore
        ? t('week.results.good.body', { phase })
        : t('week.results.good.top', { phase });
    case 'bad':
      return result.phaseBefore === WEEK.minPhase
        ? t('week.results.bad.floor', { phase })
        : t('week.results.bad.body', { phase });
    default:
      return t(`week.results.${result.result}.body`, { phase });
  }
}
