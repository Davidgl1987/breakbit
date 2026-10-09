import { useCallback, useMemo, useRef, useState } from 'react';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { toDateKey } from '@/domain/time';
import { useT } from '@/i18n/useT';
import { downloadJson } from '@/services/download';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { LineIcon } from '@/ui/icons/LineIcon';
import { CatalogList } from './CatalogList';
import { DaySimulation } from './DaySimulation';
import styles from './ExerciseLab.module.css';
import { ExerciseView } from './ExerciseView';
import { decisionLabel } from './labDisplay';
import {
  filterExercises,
  isReviewed,
  nextPending,
  NO_FILTERS,
  reviewExport,
  summarizeReviews,
  type ReviewMap,
} from './reviews';
import { useExerciseReviews, type ExerciseReviews } from './useExerciseReviews';

const EXERCISE_IDS = CATALOG.exercises.map((exercise) => exercise.id);

/**
 * /dev/exercises — Exercise Lab (internal: not linked from the app, reachable by its URL):
 * go through the catalog trying each exercise as the user sees it, rate it and decide
 * whether it stays. Reviews are saved on this device and exported as JSON; the catalog
 * itself is never touched.
 */
export function ExerciseLabScreen() {
  const { reviews, update, saveFailed } = useExerciseReviews();
  if (!reviews) return null;
  return <Lab reviews={reviews} update={update} saveFailed={saveFailed} />;
}

function Lab({
  reviews,
  update,
  saveFailed,
}: Omit<ExerciseReviews, 'reviews'> & { reviews: ReviewMap }) {
  const { t, locale } = useT();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [selectedId, setSelectedId] = useState<string>();
  // On a phone the catalog and the exercise take turns; side by side on wider screens.
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [simulating, setSimulating] = useState(false);
  const closeSimulation = useCallback(() => setSimulating(false), []);
  const detailRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => filterExercises(CATALOG.exercises, filters, reviews, locale),
    [filters, reviews, locale],
  );
  const summary = summarizeReviews(EXERCISE_IDS, reviews);
  const selected = CATALOG.exercises.find((exercise) => exercise.id === selectedId);

  // The next pending one in the filtered list; with none left there, in the whole catalog.
  const pending = (id: string) => !isReviewed(reviews[id]);
  const visibleIds = new Set(visible.map((exercise) => exercise.id));
  const nextId =
    nextPending(EXERCISE_IDS, selectedId, (id) => visibleIds.has(id) && pending(id)) ??
    nextPending(EXERCISE_IDS, selectedId, pending);

  const select = (exerciseId: string) => {
    setSelectedId(exerciseId);
    setView('detail');
    detailRef.current?.scrollTo({ top: 0 });
    window.scrollTo(0, 0);
  };
  const goNext = () => {
    if (nextId) select(nextId);
  };
  const exportReview = () => {
    const now = new Date();
    downloadJson(
      `breakbit-revision-ejercicios-${toDateKey(now.getTime())}.json`,
      reviewExport(CATALOG.exercises, reviews, now.toISOString()),
    );
  };

  return (
    <main className={styles.lab} data-view={view}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <IconButton label={t('lab.backToApp')} to={ROUTES.today}>
            <LineIcon name="chevron-left" size={24} />
          </IconButton>
          <div>
            <h1 className={styles.title}>{t('lab.title')}</h1>
            <p className={styles.subtitle}>{t('lab.subtitle')}</p>
          </div>
        </div>

        <div className={styles.progress}>
          <p className={styles.progressLine}>
            <strong>
              {t('lab.progress.reviewed', { reviewed: summary.reviewed, total: summary.total })}
            </strong>
            <span className={styles.hint}>
              {t('lab.progress.tested', { count: summary.tested })}
            </span>
          </p>
          <ProgressBar
            value={summary.reviewed}
            max={summary.total}
            label={t('lab.progress.label')}
            size="sm"
          />
          <p className={styles.summary}>
            <span>
              {decisionLabel(t, 'keep')}: {summary.keep}
            </span>
            <span>
              {decisionLabel(t, 'rework')}: {summary.rework}
            </span>
            <span>
              {decisionLabel(t, 'delete')}: {summary.delete}
            </span>
            <span>{t('lab.progress.pending', { count: summary.pending })}</span>
          </p>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={() => setSimulating(true)}>
            {t('lab.actions.simulate')}
          </Button>
          <Button variant="secondary" size="sm" onClick={exportReview}>
            {t('lab.actions.export')}
          </Button>
          <Button
            size="sm"
            disabled={!nextId}
            onClick={goNext}
            iconEnd={<LineIcon name="chevron-right" size={18} />}
          >
            {summary.pending === 0 ? t('lab.actions.allReviewed') : t('lab.actions.nextPending')}
          </Button>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.listPane} aria-label={t('lab.catalog.title')}>
          <CatalogList
            exercises={visible}
            filters={filters}
            onFilters={setFilters}
            reviews={reviews}
            selectedId={selectedId}
            onSelect={select}
          />
        </aside>

        <div ref={detailRef} className={styles.detailPane}>
          {saveFailed && (
            <InlineMessage tone="danger" icon="warning">
              {t('lab.saveFailed')}
            </InlineMessage>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={styles.backToList}
            onClick={() => setView('list')}
            iconStart={<LineIcon name="chevron-left" size={18} />}
          >
            {t('lab.actions.backToList')}
          </Button>
          {selected ? (
            <ExerciseView
              key={selected.id}
              exercise={selected}
              review={reviews[selected.id]}
              onReview={(patch) => update(selected.id, patch)}
              onNext={goNext}
              canGoNext={nextId !== undefined}
            />
          ) : (
            <Card variant="tinted" className={styles.empty}>
              <h2 className={styles.cardTitle}>{t('lab.empty.title')}</h2>
              <p>{summary.pending === 0 ? t('lab.empty.done') : t('lab.empty.body')}</p>
              {summary.pending === 0 ? (
                <Button size="lg" onClick={exportReview}>
                  {t('lab.actions.export')}
                </Button>
              ) : (
                <Button size="lg" onClick={goNext}>
                  {t('lab.empty.start')}
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      <DaySimulation
        open={simulating}
        onClose={closeSimulation}
        reviews={reviews}
        onPick={(exerciseId) => {
          closeSimulation();
          select(exerciseId);
        }}
      />
    </main>
  );
}
