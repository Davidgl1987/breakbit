import { Fragment } from 'react';
import { CATALOG } from '@/content/catalog';
import {
  favouriteExercises,
  leastLikedExercises,
  type ExerciseLikes,
} from '@/domain/stats/ratings';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './progress.module.css';

/** "Tus ejercicios": the ones the user likes most and least, from their ratings. */
export function LikesCard({ stats }: { stats: readonly ExerciseLikes[] }) {
  const { t, locale } = useT();
  const groups = [
    { key: 'liked', icon: 'mood_great', items: favouriteExercises(stats) },
    { key: 'disliked', icon: 'mood_bad', items: leastLikedExercises(stats) },
  ] as const;
  const any = groups.some((group) => group.items.length > 0);
  const name = (id: string) =>
    CATALOG.exercises.find((exercise) => exercise.id === id)?.name[locale] ?? id;
  return (
    <Card as="section" className={styles.card}>
      <div className={styles.headTexts}>
        <h2 className={styles.title}>{t('progress.likes.title')}</h2>
        <p className={styles.muted}>{t('progress.likes.caption')}</p>
      </div>
      {!any && <p className={styles.muted}>{t('progress.likes.empty')}</p>}
      {groups.map(
        (group) =>
          group.items.length > 0 && (
            <Fragment key={group.key}>
              {group.key === 'disliked' ? (
                <details className={styles.likesGroup}>
                  <summary>{t('progress.likes.disliked')}</summary>
                  <RatingList group={group} name={name} />
                </details>
              ) : (
                <div className={styles.likesGroup}>
                  <RatingList group={group} name={name} />
                </div>
              )}
            </Fragment>
          ),
      )}
    </Card>
  );
}

function RatingList({
  group,
  name,
}: {
  group: {
    key: 'liked' | 'disliked';
    icon: 'mood_great' | 'mood_bad';
    items: readonly ExerciseLikes[];
  };
  name: (id: string) => string;
}) {
  const { t } = useT();
  return (
    <ul className={styles.list}>
      {group.items.map((stat) => (
        <li key={stat.exerciseId}>
          <ListRow
            leading={<PixelIcon name={group.icon} size={24} />}
            title={name(stat.exerciseId)}
            trailing={
              <span className={styles.muted}>
                {t('progress.likes.votes', {
                  count: group.key === 'liked' ? stat.liked : stat.disliked,
                })}
              </span>
            }
            chevron={false}
          />
        </li>
      ))}
    </ul>
  );
}
