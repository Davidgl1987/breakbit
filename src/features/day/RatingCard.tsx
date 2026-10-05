import type { ExerciseRating, ScheduledActivity } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { activityDate } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { Card } from '@/ui/components/Card/Card';
import { ChipGroup } from '@/ui/components/ChipGroup/ChipGroup';
import type { IconName } from '@/ui/icons/iconNames';
import styles from './CompletionView.module.css';

const RATINGS: { value: ExerciseRating; icon: IconName }[] = [
  { value: 'liked', icon: 'mood_great' },
  { value: 'okay', icon: 'mood_good' },
  { value: 'disliked', icon: 'mood_bad' },
];

/** "¿Qué te ha parecido?": optional, one tap, and it can be changed while here. */
export function RatingCard({ activity }: { activity: ScheduledActivity }) {
  const { t } = useT();
  const ratePause = useAppStore((state) => state.ratePause);
  return (
    <Card as="section" className={styles.rating}>
      <h2 className={styles.ratingTitle}>{t('pause.done.rating.title')}</h2>
      <ChipGroup<ExerciseRating | ''>
        label={t('pause.done.rating.title')}
        fill
        value={activity.rating ?? ''}
        onChange={(rating) => {
          if (rating) ratePause(activityDate(activity.id), activity.id, rating);
        }}
        options={RATINGS.map(({ value, icon }) => ({
          value,
          icon,
          label: t(`pause.done.rating.${value}`),
        }))}
      />
      <p className={styles.muted}>{t('pause.done.rating.hint')}</p>
    </Card>
  );
}
