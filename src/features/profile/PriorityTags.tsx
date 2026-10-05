import type { DiscomfortLevels } from '@/domain/types';
import { areaIcon, areaName, priorityAreas } from '@/features/day/catalogDisplay';
import { useT } from '@/i18n/useT';
import { Tag } from '@/ui/components/Tag/Tag';
import styles from './PriorityTags.module.css';

/**
 * The areas rated above 0, most bothersome first (ties keep the catalog's order), each with
 * its icon and the value it was given. Shows `empty` when there is none.
 */
export function PriorityTags({
  discomfort,
  empty,
}: {
  discomfort: DiscomfortLevels;
  empty: string;
}) {
  const { t, locale } = useT();
  const priorities = priorityAreas(discomfort);
  if (priorities.length === 0) return <p className={styles.empty}>{empty}</p>;
  return (
    <ul className={styles.tags}>
      {priorities.map(({ area, level }) => (
        <li key={area}>
          <Tag
            icon={areaIcon(area)}
            trailing={
              <span className={styles.level}>
                <span aria-hidden="true">{level}</span>
                <span className="visually-hidden">
                  {t('onboarding.summary.level', { value: level })}
                </span>
              </span>
            }
          >
            {areaName(area, locale)}
          </Tag>
        </li>
      ))}
    </ul>
  );
}
