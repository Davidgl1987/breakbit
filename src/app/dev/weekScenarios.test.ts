import { describe, expect, it } from 'vitest';
import { goodWeekStreak } from '@/domain/progress/weekly';
import { CATALOG } from '@/content/catalog';
import { areaStats } from '@/domain/stats/areas';
import { proposePriorityRebalance } from '@/domain/profile/rebalancePriorities';
import { useAppStore } from '@/state/store';
import { validatePersistedState } from '@/state/validatePersisted';
import { historyScenarioState } from './historyScenario';
import { SCENARIO_NOW, SCENARIO_WEEK, weekScenarioState, type WeekScenario } from './weekScenarios';

function judged(scenario: WeekScenario) {
  const state = useAppStore.getState();
  const sample = weekScenarioState(scenario, state);
  expect(validatePersistedState(sample)).toEqual([]);
  state.replaceData(sample);
  useAppStore.getState().evaluateWeeks(SCENARIO_NOW);
  const progress = useAppStore.getState().progress;
  return { progress, week: progress.weeklyResults.at(-1)! };
}

describe('weekly test scenarios', () => {
  it('a good week evolves the avatar, second good week in a row', () => {
    const { progress, week } = judged('evolve');
    expect(week).toMatchObject({
      week: SCENARIO_WEEK,
      result: 'good',
      phaseBefore: 3,
      phaseAfter: 4,
    });
    expect(goodWeekStreak(progress.weeklyResults)).toBe(2);
  });

  it('a steady week keeps the phase', () => {
    expect(judged('stable').week).toMatchObject({
      result: 'regular',
      phaseBefore: 3,
      phaseAfter: 3,
    });
  });

  it('a good week at the top brings the next room item', () => {
    const { progress, week } = judged('room');
    expect(week).toMatchObject({ result: 'good', phaseAfter: 5, unlocked: 'lamp' });
    expect(progress.unlockedRoomItems).toEqual(['plant', 'picture', 'lamp']);
  });

  it('provides a phase decrease and a short week without changing the rules', () => {
    expect(judged('bad').week).toMatchObject({ result: 'bad', phaseBefore: 3, phaseAfter: 2 });
    expect(judged('neutral').week).toMatchObject({
      result: 'neutral',
      planned: 2,
      good: 2,
      phaseBefore: 2,
      phaseAfter: 2,
    });
  });

  it('includes completed exercise records to preview a priority redistribution', () => {
    judged('evolve');
    const state = useAppStore.getState();
    const activity = areaStats('2026-10-05', '2026-10-11', state.days, CATALOG);
    const changes = proposePriorityRebalance(
      state.settings.discomfort,
      activity,
      CATALOG.areas.map((area) => area.id),
    );
    expect(changes?.[0].area).toBe('upper_back');
    expect(changes?.[1].area).toBe('hips_legs');
  });
});

describe('history test scenario', () => {
  it('is a valid state with eight judged weeks and today under way', () => {
    const sample = historyScenarioState(useAppStore.getState());
    expect(validatePersistedState(sample)).toEqual([]);
    expect(sample.progress.weeklyResults).toHaveLength(8);
    expect(sample.progress.lastSeenWeek).toBe(sample.progress.lastEvaluatedWeek);
    expect(sample.days['2026-10-14']?.status).toBe('active');
    expect(sample.days['2026-09-23']?.status).toBe('absent');
    expect(
      Object.values(sample.days).filter((day) => day?.status === 'closed').length,
    ).toBeGreaterThan(30);
  });
});
