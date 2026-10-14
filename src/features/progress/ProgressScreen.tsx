import { useMemo } from 'react';
import { CATALOG } from '@/content/catalog';
import { areaStats } from '@/domain/stats/areas';
import { heatmapWeeks } from '@/domain/stats/heatmap';
import { weekInsights } from '@/domain/stats/insights';
import { exerciseRatings, favouriteExercises, leastLikedExercises } from '@/domain/stats/ratings';
import { weekStats } from '@/domain/stats/weekStats';
import { addDays, startOfWeek, weekdayOf } from '@/domain/time';
import { useToday } from '@/features/day/useToday';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { AreasCard } from './AreasCard';
import { ConstancyCard } from './ConstancyCard';
import { EvolutionCard } from './EvolutionCard';
import { HistoryCard } from './HistoryCard';
import { InsightsCard } from './InsightsCard';
import {
  FirstProgressStep,
  FirstWeekCard,
  InitialEvolutionCard,
  PendingProgressSections,
} from './InitialProgress';
import { LikesCard } from './LikesCard';
import { useHistory } from './useHistory';
import { WeekSummaryCard } from './WeekSummaryCard';

/** Days the areas look back over (four weeks). */
const AREA_DAYS = 28;

/**
 * "/progress": the avatar's evolution, consistency over the months, this week in
 * numbers, the areas moved most, the exercises liked most and least, what's worth telling
 * about the week, and past weeks.
 */
export function ProgressScreen() {
  const { t } = useT();
  const { date: today } = useToday(60_000);
  const history = useHistory(today);
  const ledger = useAppStore((state) => state.xpLedger);
  const results = useAppStore((state) => state.progress.weeklyResults);
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const unlocked = useAppStore((state) => state.progress.unlockedRoomItems);
  const monday = startOfWeek(today);

  const likes = useMemo(() => exerciseRatings(history.days, CATALOG), [history]);
  const { current, previous, insights, areas } = useMemo(() => {
    const thisWeek = weekStats(monday, history, ledger);
    // The same stretch of last week (Monday up to the same weekday), for a fair comparison.
    const lastWeek = weekStats(addDays(monday, -7), history, ledger, weekdayOf(today));
    return {
      current: thisWeek,
      previous: lastWeek,
      // Missed workdays alone are not a previous week of recorded activity.
      insights: weekInsights(
        thisWeek,
        lastWeek.planned > 0 || lastWeek.mainDays > 0 || lastWeek.movementSec > 0
          ? lastWeek
          : undefined,
      ),
      areas: areaStats(addDays(today, -(AREA_DAYS - 1)), today, history.days, CATALOG),
    };
  }, [monday, today, history, ledger]);

  const hasMovement = Object.entries(history.days).some(
    ([date, day]) =>
      date <= today &&
      ((day?.summary?.completed ?? 0) > 0 ||
        day?.summary?.mainCompleted ||
        (day?.summary?.movementSec ?? 0) > 0 ||
        day?.plan?.activities.some((activity) => activity.status === 'completed')),
  );
  // A plan without a completed pause still uses the approved first-step design.
  // Imported XP, summaries, weekly results and rewards keep their actual evolution.
  const hasEvolution =
    hasMovement || ledger.length > 0 || results.length > 0 || phase > 1 || unlocked.length > 0;
  const hasConstancy = heatmapWeeks(monday, 4, history)
    .flat()
    .some((cell) => typeof cell.level === 'number' && cell.level > 0);
  const hasLikes = favouriteExercises(likes).length > 0 || leastLikedExercises(likes).length > 0;
  const hasWeek =
    current.completed > 0 || current.mainDays > 0 || current.movementSec > 0 || current.xp > 0;
  const hasPreviousWeek = previous.planned > 0 || previous.mainDays > 0 || previous.movementSec > 0;

  return (
    <>
      <ScreenHeader title={t('progress.initial.title')} />
      {hasEvolution ? <EvolutionCard history={history} /> : <InitialEvolutionCard />}
      {!hasEvolution && <FirstProgressStep />}
      {hasWeek && (
        <WeekSummaryCard
          stats={current}
          previous={hasPreviousWeek ? previous : undefined}
          from={monday}
          to={addDays(monday, 6)}
        />
      )}
      {hasConstancy && <ConstancyCard history={history} />}
      {hasLikes && <LikesCard stats={likes} />}
      {areas.length > 0 && <AreasCard areas={areas} />}
      <PendingProgressSections
        constancy={!hasConstancy}
        favourites={!hasLikes}
        areas={areas.length === 0}
      />
      {hasWeek && insights.length > 0 && (
        <details>
          <summary>{t('common.seeMore')}</summary>
          <InsightsCard insights={insights} today={today} />
        </details>
      )}
      {results.length > 0 ? <HistoryCard results={results} /> : <FirstWeekCard />}
    </>
  );
}
