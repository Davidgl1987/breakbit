import { useMemo } from 'react';
import { CATALOG } from '@/content/catalog';
import { areaStats } from '@/domain/stats/areas';
import { weekInsights } from '@/domain/stats/insights';
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
import { useHistory } from './useHistory';
import { WeekSummaryCard } from './WeekSummaryCard';

/** Days the areas look back over (four weeks). */
const AREA_DAYS = 28;

/**
 * "/progress": the avatar's evolution, consistency over the months, this week in
 * numbers, the areas moved most, what's worth telling about the week, and past weeks.
 */
export function ProgressScreen() {
  const { t } = useT();
  const { date: today } = useToday(60_000);
  const history = useHistory(today);
  const ledger = useAppStore((state) => state.xpLedger);
  const results = useAppStore((state) => state.progress.weeklyResults);
  const monday = startOfWeek(today);

  const { current, insights, areas } = useMemo(() => {
    const thisWeek = weekStats(monday, history, ledger);
    // The same stretch of last week (Monday up to the same weekday), for a fair comparison.
    const lastWeek = weekStats(addDays(monday, -7), history, ledger, weekdayOf(today));
    return {
      current: thisWeek,
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
      <ConstancyCard history={history} />
      <WeekSummaryCard stats={current} from={monday} to={addDays(monday, 6)} />
      <AreasCard areas={areas} />
      <InsightsCard insights={insights} today={today} />
      <HistoryCard results={results} />
    </>
  );
}
