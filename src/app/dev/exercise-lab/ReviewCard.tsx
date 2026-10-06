import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { ChipGroup } from '@/ui/components/ChipGroup/ChipGroup';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './ExerciseLab.module.css';
import { decisionLabel, RATINGS, SCORES } from './labDisplay';
import {
  DECISIONS,
  type ExerciseReview,
  type ReviewPatch,
  type ReviewRating,
  type ReviewScore,
} from './reviews';

interface ReviewCardProps {
  review: ExerciseReview | undefined;
  onReview: (patch: ReviewPatch) => void;
  onNext: () => void;
  canGoNext: boolean;
  /** A trial just ended: invite to rate it. */
  justTried: boolean;
}

/** Rate, score, decide and take notes; every change is saved as it happens. */
export function ReviewCard({ review, onReview, onNext, canGoNext, justTried }: ReviewCardProps) {
  const { t } = useT();
  return (
    <Card as="section" className={styles.card}>
      {justTried && <InlineMessage icon="completed">{t('lab.trial.done')}</InlineMessage>}
      <h2 className={styles.cardTitle}>{t('lab.review.title')}</h2>

      <ChipGroup
        label={t('lab.review.rating')}
        showLabel
        fill
        value={review?.rating ? String(review.rating) : ''}
        onChange={(value) => onReview({ rating: Number(value) as ReviewRating })}
        options={RATINGS.map(({ value, emoji, key }) => ({
          value: String(value),
          label: `${emoji} ${t(`lab.review.ratings.${key}`)}`,
        }))}
      />
      <ScoreField
        label={t('lab.review.exerciseQuality')}
        hint={t('lab.review.exerciseQualityHint')}
        value={review?.exerciseQuality}
        onChange={(exerciseQuality) => onReview({ exerciseQuality })}
      />
      <ScoreField
        label={t('lab.review.microbreakQuality')}
        hint={t('lab.review.microbreakQualityHint')}
        value={review?.microbreakQuality}
        onChange={(microbreakQuality) => onReview({ microbreakQuality })}
      />
      <ChipGroup
        label={t('lab.decision.title')}
        showLabel
        fill
        value={review?.decision ?? 'pending'}
        onChange={(decision) => onReview({ decision })}
        options={DECISIONS.map((decision) => ({
          value: decision,
          label: decisionLabel(t, decision),
        }))}
      />
      <Checkbox
        checked={review?.tested ?? false}
        onChange={(tested) => onReview({ tested })}
        label={t('lab.review.tested')}
      />
      <label className={styles.field}>
        <span className={styles.label}>{t('lab.review.notes')}</span>
        <textarea
          className={styles.input}
          rows={3}
          value={review?.notes ?? ''}
          placeholder={t('lab.review.notesPlaceholder')}
          onChange={(event) => onReview({ notes: event.target.value })}
        />
      </label>

      <div className={styles.field}>
        {review && (
          <p className={styles.hint}>
            {t('lab.review.savedAt', { time: formatClock(Date.parse(review.updatedAt)) })}
          </p>
        )}
        <Button
          size="lg"
          fullWidth
          disabled={!canGoNext}
          onClick={onNext}
          iconEnd={<LineIcon name="chevron-right" />}
        >
          {t('lab.actions.nextPending')}
        </Button>
      </div>
    </Card>
  );
}

/** A 1–5 score with what it measures. */
function ScoreField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: ReviewScore | undefined;
  onChange: (value: ReviewScore) => void;
}) {
  return (
    <div className={styles.field}>
      <div>
        <p className={styles.label}>{label}</p>
        <p className={styles.hint}>{hint}</p>
      </div>
      <ChipGroup
        label={label}
        fill
        value={value ? String(value) : ''}
        onChange={(score) => onChange(Number(score) as ReviewScore)}
        options={SCORES.map((score) => ({ value: String(score), label: String(score) }))}
      />
    </div>
  );
}
