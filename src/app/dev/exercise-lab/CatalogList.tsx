import { useEffect, useRef } from 'react';
import { CATALOG } from '@/content/catalog';
import type { Exercise } from '@/domain/types';
import { areaIcon, areaName, equipmentName } from '@/features/day/catalogDisplay';
import { formatSeconds } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { ChipGroup } from '@/ui/components/ChipGroup/ChipGroup';
import { cx } from '@/ui/cx';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './ExerciseLab.module.css';
import { decisionLabel } from './labDisplay';
import { NO_FILTERS, type LabFilters, type ReviewDecision, type ReviewMap } from './reviews';

/** Only the equipment some exercise uses (the standing desk is for main activities). */
const EXERCISE_EQUIPMENT = CATALOG.equipment.filter((item) =>
  CATALOG.exercises.some((exercise) => exercise.equipment.includes(item.id)),
);

interface CatalogListProps {
  /** Already filtered. */
  exercises: readonly Exercise[];
  filters: LabFilters;
  onFilters: (filters: LabFilters) => void;
  reviews: ReviewMap;
  selectedId?: string;
  onSelect: (exerciseId: string) => void;
}

/** The side column: search, filters and every exercise with where its review stands. */
export function CatalogList({
  exercises,
  filters,
  onFilters,
  reviews,
  selectedId,
  onSelect,
}: CatalogListProps) {
  const { t, locale } = useT();
  const listRef = useRef<HTMLUListElement>(null);
  const change = (patch: Partial<LabFilters>) => onFilters({ ...filters, ...patch });

  // Follow the selection ("Siguiente pendiente", the simulated day) down the list.
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);
  const filtered =
    filters.query !== '' ||
    filters.status !== 'all' ||
    filters.equipment !== 'all' ||
    filters.area !== 'all';

  return (
    <>
      <input
        type="search"
        className={styles.input}
        placeholder={t('lab.catalog.search')}
        aria-label={t('lab.catalog.search')}
        value={filters.query}
        onChange={(event) => change({ query: event.target.value })}
      />
      <ChipGroup<LabFilters['status']>
        label={t('lab.catalog.status')}
        value={filters.status}
        onChange={(status) => change({ status })}
        options={[
          { value: 'all', label: t('lab.catalog.allStatus') },
          { value: 'pending', label: t('lab.catalog.pendingStatus') },
          ...(['keep', 'rework', 'delete'] as const).map((decision) => ({
            value: decision,
            label: decisionLabel(t, decision),
          })),
        ]}
      />
      <div className={styles.selects}>
        <select
          className={styles.input}
          aria-label={t('lab.catalog.equipment')}
          value={filters.equipment}
          onChange={(event) => change({ equipment: event.target.value })}
        >
          <option value="all">{t('lab.catalog.allEquipment')}</option>
          <option value="none">{t('lab.catalog.noEquipment')}</option>
          {EXERCISE_EQUIPMENT.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name[locale]}
            </option>
          ))}
        </select>
        <select
          className={styles.input}
          aria-label={t('lab.catalog.area')}
          value={filters.area}
          onChange={(event) => change({ area: event.target.value })}
        >
          <option value="all">{t('lab.catalog.allAreas')}</option>
          {CATALOG.areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name[locale]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.listHead}>
        <span>{t('lab.catalog.count', { count: exercises.length })}</span>
        {filtered && (
          <button type="button" className={styles.linkButton} onClick={() => onFilters(NO_FILTERS)}>
            {t('lab.catalog.clearFilters')}
          </button>
        )}
      </div>

      {exercises.length === 0 ? (
        <p className={styles.muted}>{t('lab.catalog.empty')}</p>
      ) : (
        <ul ref={listRef} className={styles.list}>
          {exercises.map((exercise) => {
            const review = reviews[exercise.id];
            const mainArea = exercise.areas[0];
            const meta = [
              mainArea && areaName(mainArea, locale),
              exercise.equipment.length > 0
                ? exercise.equipment.map((id) => equipmentName(id, locale)).join(', ')
                : t('lab.catalog.noEquipment'),
              formatSeconds(exercise.durationSec),
            ]
              .filter(Boolean)
              .join(' · ');
            const selected = exercise.id === selectedId;
            return (
              <li key={exercise.id}>
                <button
                  type="button"
                  className={cx(styles.row, selected && styles.rowSelected)}
                  aria-current={selected || undefined}
                  onClick={() => onSelect(exercise.id)}
                >
                  {mainArea && <PixelIcon name={areaIcon(mainArea)} size={24} />}
                  <span className={styles.rowTexts}>
                    <span className={styles.rowName}>{exercise.name[locale]}</span>
                    <span className={styles.rowMeta}>{meta}</span>
                  </span>
                  <span className={styles.rowStatus}>
                    <DecisionBadge decision={review?.decision ?? 'pending'} />
                    {review?.tested && (
                      <span className={styles.tested}>✓ {t('lab.catalog.tested')}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export function DecisionBadge({ decision }: { decision: ReviewDecision }) {
  const { t } = useT();
  return <span className={cx(styles.badge, styles[decision])}>{decisionLabel(t, decision)}</span>;
}
