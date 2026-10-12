import type { DailySummary } from '@/domain/types';
import { formatActiveTime } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import styles from './DayFacts.module.css';

/** Quiet facts, one per row; used in the close flow and the closed day. */
export function DayFacts({
  summary,
  hasMain = false,
}: {
  summary: DailySummary;
  hasMain?: boolean;
}) {
  const { t } = useT();
  const facts = [
    [t('dayEnd.stats.movement'), formatActiveTime(summary.movementSec)],
    [t('dayEnd.stats.interruption'), formatActiveTime(summary.interruptionSec)],
    [
      t('today.pausesDone', {
        done: summary.completed,
        total: summary.planned,
      }),
      '',
    ],
    ...(hasMain
      ? [
          [
            t('dayEnd.stats.main'),
            summary.mainCompleted ? t('dayEnd.stats.mainDone') : t('dayEnd.stats.mainPending'),
          ],
        ]
      : []),
    [
      summary.missed > 0
        ? t('dayEnd.stats.missed', { count: summary.missed })
        : t('dayEnd.stats.noneMissed'),
      '',
    ],
    ...(summary.firstPrompt > 0
      ? [[t('dayEnd.stats.firstTry', { count: summary.firstPrompt }), '']]
      : []),
    ...(summary.postponed > 0
      ? [[t('dayEnd.stats.postponed', { count: summary.postponed }), '']]
      : []),
    ['XP', summary.xp > 0 ? `+${summary.xp}` : String(summary.xp)],
  ];
  return (
    <dl className={styles.facts}>
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
