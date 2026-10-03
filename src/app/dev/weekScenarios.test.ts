import { describe, expect, it } from 'vitest';
import { goodWeekStreak } from '@/domain/progress/weekly';
import { useAppStore } from '@/state/store';
import { validatePersistedState } from '@/state/validatePersisted';
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
});
