import { useRef, useState } from 'react';
import { CATALOG } from '@/content/catalog';
import {
  proposePriorityRebalance,
  type PriorityChange,
} from '@/domain/profile/rebalancePriorities';
import { areaStats } from '@/domain/stats/areas';
import { addDays } from '@/domain/time';
import type { DiscomfortLevels, WeeklyResult } from '@/domain/types';
import { DiscomfortFields } from '@/features/profile/DiscomfortFields';
import { useSaveSettings } from '@/features/settings/useSaveSettings';
import { useT } from '@/i18n/useT';
import { formatDayRange } from '@/i18n/translate';
import { useAppStore } from '@/state/store';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import styles from './WeekScreen.module.css';

/** Optional weekly review, using the same sliders as onboarding and Settings. */
export function WeeklyPrioritySheet({
  result,
  onClose,
  onSaved,
}: {
  result: WeeklyResult;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, locale } = useT();
  const priorities = useAppStore((state) => state.settings.discomfort);
  const days = useAppStore((state) => state.days);
  const markRebalanced = useAppStore((state) => state.markWeekPrioritiesRebalanced);
  const saveSettings = useSaveSettings();
  const [draft, setDraft] = useState<DiscomfortLevels>(priorities);
  const [proposal, setProposal] = useState<readonly PriorityChange[]>();
  const [applied, setApplied] = useState(false);
  const [status, setStatus] = useState('');
  const suggestRef = useRef<HTMLButtonElement>(null);
  const blocked = result.prioritiesRebalanced || applied;
  const suggest = () => {
    const stats = areaStats(result.start, addDays(result.start, 6), days, CATALOG);
    const changes = proposePriorityRebalance(
      draft,
      stats,
      CATALOG.areas.map((area) => area.id),
    );
    setProposal(changes);
    setStatus(t(changes ? 'week.review.preview' : 'week.review.noSuggestion'));
  };
  const apply = () => {
    if (!proposal || blocked) return;
    setDraft((current) => ({
      ...current,
      ...Object.fromEntries(proposal.map((change) => [change.area, change.to])),
    }));
    setProposal(undefined);
    setApplied(true);
    setStatus(t('week.review.applied'));
    suggestRef.current?.focus();
  };
  const save = () => {
    // Weekly priorities prepare the next workdays; preserve today's sessions and plan.
    saveSettings({ discomfort: draft }, { replanToday: false });
    if (applied) markRebalanced(result.week);
    onSaved();
    onClose();
  };
  return (
    <BottomSheet
      open
      onClose={onClose}
      title={t('settings.discomfort')}
      actions={
        <>
          <Button size="lg" fullWidth onClick={save}>
            {t('settings.save')}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            {t('settings.cancel')}
          </Button>
        </>
      }
    >
      <div className={styles.editor}>
        <p className={styles.muted}>{t('week.review.question')}</p>
        <DiscomfortFields
          value={draft}
          onChange={(value) => {
            setDraft(value);
            setProposal(undefined);
            setStatus(applied ? t('week.review.applied') : '');
          }}
        />
        <section className={styles.suggestion} aria-label={t('week.review.suggest')}>
          <button
            ref={suggestRef}
            type="button"
            className={styles.textLink}
            aria-disabled={blocked || undefined}
            onClick={() => {
              if (blocked) {
                setStatus(t('week.review.alreadyApplied'));
                return;
              }
              suggest();
            }}
          >
            {t('week.review.suggest')}
          </button>
          <p className={styles.muted} aria-live="polite">
            {status ||
              t(result.prioritiesRebalanced ? 'week.review.alreadyApplied' : 'week.review.basis', {
                period: formatDayRange(locale, result.start, addDays(result.start, 6)),
              })}
          </p>
          {proposal && (
            <div className={styles.proposal}>
              <ul>
                {proposal.map((change) => (
                  <li key={change.area}>
                    <div>
                      <span>
                        {CATALOG.areas.find((area) => area.id === change.area)?.name[locale]}
                      </span>
                      <small>
                        {t('week.review.activity', { count: change.exercises })} ·{' '}
                        {t(change.to > change.from ? 'week.review.less' : 'week.review.more')}
                      </small>
                    </div>
                    <strong>
                      {change.from} → {change.to}
                    </strong>
                  </li>
                ))}
              </ul>
              <p className={styles.muted}>{t('week.review.balance')}</p>
              <div className={styles.proposalActions}>
                <button type="button" className={styles.textLink} onClick={apply}>
                  {t('week.review.apply')}
                </button>
                <button
                  type="button"
                  className={styles.textLink}
                  onClick={() => {
                    setProposal(undefined);
                    setStatus(t('week.review.discarded'));
                    suggestRef.current?.focus();
                  }}
                >
                  {t('week.review.discard')}
                </button>
              </div>
            </div>
          )}
        </section>
        <p className={styles.muted}>{t('week.review.note')}</p>
        <p className={styles.muted}>{t('week.review.nextDays')}</p>
      </div>
    </BottomSheet>
  );
}
