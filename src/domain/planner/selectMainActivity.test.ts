import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { createRng } from '../rng';
import {
  isMainActivityEligible,
  mainActivityDuration,
  pickMainActivity,
} from './selectMainActivity';

const byId = (id: string) => CATALOG.mainActivities.find((activity) => activity.id === id)!;

describe('isMainActivityEligible', () => {
  it('needs the equipment', () => {
    expect(isMainActivityEligible(byId('standing_work'), { equipment: [], slot: 'work' })).toBe(
      false,
    );
    expect(
      isMainActivityEligible(byId('standing_work'), { equipment: ['standing_desk'], slot: 'work' }),
    ).toBe(true);
  });

  it('keeps walks outside and floor work for real breaks', () => {
    expect(isMainActivityEligible(byId('walk_outside'), { equipment: [], slot: 'work' })).toBe(
      false,
    );
    expect(isMainActivityEligible(byId('walk_outside'), { equipment: [], slot: 'break' })).toBe(
      true,
    );
  });

  it('only proposes meeting-friendly activities during meetings', () => {
    expect(
      isMainActivityEligible(byId('walking_meeting'), { equipment: [], slot: 'meeting' }),
    ).toBe(true);
    expect(
      isMainActivityEligible(byId('mat_mobility'), { equipment: ['mat'], slot: 'meeting' }),
    ).toBe(false);
  });
});

describe('mainActivityDuration', () => {
  it('clamps the preferred length to the activity range', () => {
    expect(mainActivityDuration(byId('walk_outside'), 20)).toBe(20);
    expect(mainActivityDuration(byId('walk_outside'), 5)).toBe(10);
    expect(mainActivityDuration(byId('mobility_routine'), 20)).toBe(5);
  });
});

describe('pickMainActivity', () => {
  it('always has an option without equipment (walking is always available)', () => {
    for (const slot of ['work', 'break', 'meeting'] as const) {
      const pick = pickMainActivity(
        CATALOG.mainActivities,
        { equipment: [], slot, preferredMin: 20 },
        createRng(slot),
      );
      expect(pick, slot).toBeDefined();
      expect(pick!.activity.equipment).toEqual([]);
    }
  });

  it('proposes a different activity on "Otra misión" when possible', () => {
    for (let seed = 0; seed < 50; seed++) {
      const pick = pickMainActivity(
        CATALOG.mainActivities,
        { equipment: [], slot: 'break', preferredMin: 20, excludeId: 'walk_outside' },
        createRng(`m${seed}`),
      );
      expect(pick?.activity.id).not.toBe('walk_outside');
    }
  });

  it('only uses owned equipment', () => {
    for (let seed = 0; seed < 50; seed++) {
      const pick = pickMainActivity(
        CATALOG.mainActivities,
        { equipment: ['kettlebell'], slot: 'break', preferredMin: 10 },
        createRng(`k${seed}`),
      );
      expect(pick!.activity.equipment.every((item) => item === 'kettlebell')).toBe(true);
    }
  });
});
