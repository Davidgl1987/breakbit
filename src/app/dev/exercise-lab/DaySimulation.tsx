import { useMemo, useState } from 'react';
import { CATALOG } from '@/content/catalog';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { toDateKey } from '@/domain/time';
import type { Exercise, LocaleCode, ScheduledActivity } from '@/domain/types';
import { areaName, equipmentName } from '@/features/day/catalogDisplay';
import { contentItems } from '@/features/day/contentItems';
import { contentName } from '@/features/day/contentName';
import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { DecisionBadge } from './CatalogList';
import styles from './ExerciseLab.module.css';
import type { ReviewMap } from './reviews';

interface DaySimulationProps {
  open: boolean;
  onClose: () => void;
  reviews: ReviewMap;
  /** Opens an exercise of the simulated day in the lab. */
  onPick: (exerciseId: string) => void;
}

/**
 * "Simular jornada": today's plan as the real planner would make it with the user's
 * settings, to spot days that repeat areas, exercises or equipment. Each "Otra jornada"
 * is another seed, like regenerating the day.
 */
export function DaySimulation({ open, onClose, reviews, onPick }: DaySimulationProps) {
  const { t, locale } = useT();
  const settings = useAppStore((state) => state.settings);
  const [reroll, setReroll] = useState(0);
  const plan = useMemo(
    () =>
      open
        ? generateDayPlan({
            date: toDateKey(clock.now()),
            schedule: settings.schedule,
            settings,
            catalog: CATALOG,
            rerollCount: reroll,
          })
        : undefined,
    [open, settings, reroll],
  );
  const pauses = plan?.activities.filter((activity) => activity.kind === 'micro') ?? [];
  const exercises = pauses.flatMap((activity) =>
    contentItems(activity.content).map((item) => item.exercise),
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t('lab.simulation.title')}
      actions={
        <>
          <Button fullWidth onClick={() => setReroll((count) => count + 1)}>
            {t('lab.simulation.another')}
          </Button>
          <Button variant="secondary" fullWidth onClick={onClose}>
            {t('lab.simulation.close')}
          </Button>
        </>
      }
    >
      <p className={styles.hint}>{t('lab.simulation.hint')}</p>
      <ol className={styles.simList}>
        {plan?.activities.map((activity) => (
          <li key={activity.id} className={styles.simItem}>
            <span className={styles.simTime}>{formatClock(activity.scheduledAt)}</span>
            <div className={styles.simTexts}>
              <SimulatedActivity activity={activity} reviews={reviews} onPick={onPick} />
            </div>
          </li>
        ))}
      </ol>
      <dl className={styles.facts}>
        <dt>{t('lab.simulation.pauses')}</dt>
        <dd>{pauses.length}</dd>
        <dt>{t('lab.simulation.areas')}</dt>
        <dd>
          {tally(exercises.map((exercise) => exercise.areas[0] ?? ''))
            .map(([area, count]) => `${areaName(area, locale)} ${count}`)
            .join(' · ')}
        </dd>
        <dt>{t('lab.simulation.equipment')}</dt>
        <dd>
          {tally(
            exercises.flatMap((exercise) =>
              exercise.equipment.length > 0 ? exercise.equipment : [''],
            ),
          )
            .map(
              ([id, count]) =>
                `${id ? equipmentName(id, locale) : t('lab.catalog.noEquipment')} ${count}`,
            )
            .join(' · ')}
        </dd>
        <dt>{t('lab.simulation.repeated')}</dt>
        <dd>{repeatedNames(exercises, locale) || t('lab.simulation.noRepeats')}</dd>
      </dl>
    </BottomSheet>
  );
}

function SimulatedActivity({
  activity,
  reviews,
  onPick,
}: {
  activity: ScheduledActivity;
  reviews: ReviewMap;
  onPick: (exerciseId: string) => void;
}) {
  const { t, locale } = useT();
  if (activity.kind === 'main') {
    return (
      <span>
        <strong>{t('lab.simulation.main')}:</strong> {contentName(activity.content, locale)}
      </span>
    );
  }
  const slot =
    activity.slot === 'break'
      ? t('timeline.break')
      : activity.slot === 'meeting'
        ? t('timeline.meeting')
        : undefined;
  const heading = [
    activity.content.kind === 'routine' && contentName(activity.content, locale),
    slot,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <>
      {heading && <span className={styles.hint}>{heading}</span>}
      {contentItems(activity.content).map(({ exercise }, index) => {
        const decision = reviews[exercise.id]?.decision ?? 'pending';
        const mainArea = exercise.areas[0];
        return (
          <button
            key={`${exercise.id}-${index}`}
            type="button"
            className={styles.simExercise}
            onClick={() => onPick(exercise.id)}
          >
            <span>
              {exercise.name[locale]}
              {mainArea && <span className={styles.hint}> · {areaName(mainArea, locale)}</span>}
            </span>
            {decision !== 'pending' && <DecisionBadge decision={decision} />}
          </button>
        );
      })}
    </>
  );
}

/** How many times each value appears, most frequent first. */
function tally(values: readonly string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}

/** "Rotación torácica ×2, …": exercises that come up more than once in the day. */
function repeatedNames(exercises: readonly Exercise[], locale: LocaleCode): string {
  return tally(exercises.map((exercise) => exercise.id))
    .filter(([, count]) => count > 1)
    .map(([id, count]) => {
      const name = exercises.find((exercise) => exercise.id === id)?.name[locale] ?? id;
      return `${name} ×${count}`;
    })
    .join(', ');
}
