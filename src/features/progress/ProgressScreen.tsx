import { useMemo } from 'react';
import { CATALOG } from '@/content/catalog';
import { areaStats } from '@/domain/stats/areas';
import { weekInsights } from '@/domain/stats/insights';
import { exerciseRatings } from '@/domain/stats/ratings';
import { weekStats } from '@/domain/stats/weekStats';
import { addDays, startOfWeek, weekdayOf } from '@/domain/time';
import { useToday } from '@/features/day/useToday';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { AreasCard } from './AreasCard';
import { ConstancyCard } from './ConstancyCard';
import { EvolutionCard } from './EvolutionCard';
import { HistoryCard } from './HistoryCard';
import { InsightsCard } from './InsightsCard';
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
  const monday = startOfWeek(today);

  const likes = useMemo(() => exerciseRatings(history.days, CATALOG), [history]);
  const { current, previous, insights, areas } = useMemo(() => {
    const thisWeek = weekStats(monday, history, ledger);
    // The same stretch of last week (Monday up to the same weekday), for a fair comparison.
    const lastWeek = weekStats(addDays(monday, -7), history, ledger, weekdayOf(today));
    return {
      current: thisWeek,
      previous: lastWeek,
      insights: weekInsights(thisWeek, lastWeek),
      areas: areaStats(addDays(today, -(AREA_DAYS - 1)), today, history.days, CATALOG),
    };
  }, [monday, today, history, ledger]);

  return (
    <>
      <ScreenHeader
        title={t('progress.title')}
        subtitle={t('progress.subtitle')}
        trailing={<PixelIcon name="progress" size={32} />}
      />
      <EvolutionCard history={history} />
      <WeekSummaryCard stats={current} previous={previous} from={monday} to={addDays(monday, 6)} />
      <ConstancyCard history={history} />
      <LikesCard stats={likes} />
      <AreasCard areas={areas} />
      <details>
        <summary>{t('common.seeMore')}</summary>
        <InsightsCard insights={insights} today={today} />
      </details>
      <HistoryCard results={results} />
    </>
  );
}
