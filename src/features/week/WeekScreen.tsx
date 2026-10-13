import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/app/routes';
import { ROOM_ITEMS } from '@/content/roomItems';
import { WEEK } from '@/domain/config';
import { goodWeekStreak } from '@/domain/progress/weekly';
import { addDays } from '@/domain/time';
import type { WeeklyResult } from '@/domain/types';
import { formatDayRange } from '@/i18n/translate';
import { useT, type Translate } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { EvolutionSheet } from '@/ui/game/EvolutionSheet/EvolutionSheet';
import { roomItemIcon } from '@/ui/icons/domainIcons';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import { WeeklyPrioritySheet } from './WeeklyPrioritySheet';
import styles from './WeekScreen.module.css';

/** The completed week, avatar transition and optional review of next week's priorities. */
export function WeekScreen() {
  const { week = '' } = useParams();
  const results = useAppStore((state) => state.progress.weeklyResults);
  const seen = useAppStore((state) => state.progress.lastSeenWeek);
  const index = results.findIndex((item) => item.week === week);
  if (index < 0) return <Navigate to={ROUTES.today} replace />;
  const reviewable = week === results.at(-1)?.week && (seen === undefined || week > seen);
  return (
    <Week
      key={week}
      result={results[index]!}
      streak={goodWeekStreak(results.slice(0, index + 1))}
      reviewable={reviewable}
    />
  );
}

function Week({
  result,
  streak,
  reviewable,
}: {
  result: WeeklyResult;
  streak: number;
  reviewable: boolean;
}) {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const markWeekSeen = useAppStore((state) => state.markWeekSeen);
  const unlockedIds = useAppStore((state) => state.progress.unlockedRoomItems);
  const [sheet, setSheet] = useState<'phases' | 'priorities'>();
  const [reviewSaved, setReviewSaved] = useState(false);
  const evolved = result.phaseAfter > result.phaseBefore;
  const unlocked = ROOM_ITEMS.find((item) => item.id === result.unlocked);
  const phase = t(`evolution.phases.p${result.phaseAfter}`);
  const heroLabel = unlocked
    ? t('week.design.reward')
    : t(
        evolved
          ? 'week.design.newPhase'
          : result.result === 'bad'
            ? 'week.design.currentPhase'
            : result.result === 'neutral'
              ? 'week.design.keptPhase'
              : 'week.design.samePhase',
      );

  return (
    <>
      <FlowLayout
        top={
          <div className={styles.top}>
            <span className={styles.label}>{t('week.label')}</span>
            <IconButton label={t('common.close')} to={ROUTES.today}>
              <LineIcon name="close" size={22} />
            </IconButton>
          </div>
        }
        header={
          <header className={styles.header}>
            <h1 className={styles.title}>
              {t(
                unlocked
                  ? 'week.design.roomTitle'
                  : result.result === 'good' && !evolved
                    ? 'week.design.goodTop'
                    : `week.design.titles.${result.result}`,
              )}
            </h1>
            <p className={styles.muted}>
              {formatDayRange(locale, result.start, addDays(result.start, 6))}
            </p>
          </header>
        }
        footer={
          <Button
            size="lg"
            fullWidth
            onClick={() =>
              runScreenTransition(() => {
                markWeekSeen(result.week);
                navigate(ROUTES.today, { replace: true });
              })
            }
          >
            {t('week.continue')} <LineIcon name="chevron-right" />
          </Button>
        }
      >
        <Card as="section" variant="tinted" className={styles.hero}>
          <span className={styles.label}>{heroLabel}</span>
          <h2 className={styles.heroTitle}>{unlocked?.name[locale] ?? phase}</h2>
          {unlocked ? (
            <div className={styles.object}>
              <PixelIcon name={roomItemIcon(unlocked.id)} size={48} label={unlocked.name[locale]} />
            </div>
          ) : (
            <div className={styles.avatarPair}>
              <div className={styles.previousAvatar}>
                <Avatar
                  phase={result.phaseBefore}
                  size="xl"
                  framed={false}
                  label={t('week.design.beforeAvatar', {
                    phase: t(`evolution.phases.p${result.phaseBefore}`),
                  })}
                />
                <span>
                  {t('week.design.before')}
                  <small>{t('week.design.phase', { phase: result.phaseBefore })}</small>
                </span>
              </div>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
              <div className={styles.currentAvatar}>
                <Avatar
                  phase={result.phaseAfter}
                  pose={evolved ? 'celebrate' : 'idle'}
                  size="xl"
                  framed={false}
                  label={t('week.design.currentAvatar', { phase })}
                />
                <span>
                  {t('week.design.now')}
                  <small>{t('week.design.phase', { phase: result.phaseAfter })}</small>
                </span>
              </div>
            </div>
          )}
        </Card>

        <div className={styles.phaseLine}>
          <span>
            {result.phaseBefore === result.phaseAfter
              ? t('week.design.phaseName', {
                  phase: result.phaseAfter,
                  name: phase,
                })
              : t('week.design.transition', {
                  before: result.phaseBefore,
                  after: result.phaseAfter,
                })}
          </span>
          <button type="button" className={styles.textLink} onClick={() => setSheet('phases')}>
            {t('week.design.phases')} <LineIcon name="chevron-down" size={18} />
          </button>
        </div>

        <section className={styles.result} aria-label={t('week.label')}>
          <p>{phaseMessage(result, t)}</p>
          <dl className={styles.stats}>
            {result.planned > 0 && (
              <div>
                <dt>{t('week.design.goodDays')}</dt>
                <dd>
                  {t('week.design.tally', {
                    good: result.good,
                    planned: result.planned,
                  })}
                </dd>
              </div>
            )}
            {streak >= 2 && (
              <div>
                <dt>{t('week.design.consistency')}</dt>
                <dd>
                  <PixelIcon name="streak" size={24} />
                  {t('week.streak', { count: streak })}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {unlocked && (
          <section className={styles.room}>
            <h2 className={styles.sectionTitle}>{t('week.room')}</h2>
            <ul className={styles.inventory} aria-label={t('week.room')}>
              {ROOM_ITEMS.filter((item) => unlockedIds.includes(item.id)).map((item) => (
                <li key={item.id}>
                  <PixelIcon name={roomItemIcon(item.id)} size={32} label={item.name[locale]} />
                  <span>
                    {item.name[locale]}
                    {item.id === unlocked.id && (
                      <small className={styles.fresh}>{t('week.new')}</small>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {reviewable && (
          <section className={styles.review}>
            <span className={styles.label}>{t('week.review.label')}</span>
            <h2 className={styles.sectionTitle}>{t('week.review.title')}</h2>
            <p className={styles.muted}>{t('week.review.body')}</p>
            <button
              type="button"
              className={styles.textLink}
              onClick={() => setSheet('priorities')}
            >
              {t('week.review.open')} <LineIcon name="chevron-right" size={18} />
            </button>
            {reviewSaved && (
              <p className={styles.muted} role="status">
                {t('week.review.saved')}
              </p>
            )}
          </section>
        )}
      </FlowLayout>
      {sheet === 'phases' && (
        <EvolutionSheet phase={result.phaseAfter} onClose={() => setSheet(undefined)} />
      )}
      {sheet === 'priorities' && (
        <WeeklyPrioritySheet
          result={result}
          onClose={() => setSheet(undefined)}
          onSaved={() => setReviewSaved(true)}
        />
      )}
    </>
  );
}

/** What the week did to the avatar; evolution remains independent from priorities and XP. */
function phaseMessage(result: WeeklyResult, t: Translate): string {
  const phase = t(`evolution.phases.p${result.phaseAfter}`);
  switch (result.result) {
    case 'good':
      return result.phaseAfter > result.phaseBefore
        ? t('week.results.good.body', { phase })
        : t('week.results.good.top', { phase });
    case 'bad':
      return result.phaseBefore === WEEK.minPhase
        ? t('week.results.bad.floor', { phase })
        : t('week.results.bad.body', { phase });
    default:
      return t(`week.results.${result.result}.body`, { phase });
  }
}
