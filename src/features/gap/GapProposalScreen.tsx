import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { mainPath, pausePlayPath, ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { GAP, XP } from '@/domain/config';
import { dayEquipment } from '@/domain/day/today';
import { isGapOption, proposeGap, type GapOption, type GapProposal } from '@/domain/gap/gap';
import { isMainRunning } from '@/domain/main/session';
import type { DateKey, DayPlan } from '@/domain/types';
import { MovesPreview } from '@/features/day/ActivityPresentation';
import {
  areaIcon,
  areaName,
  equipmentIcon,
  equipmentName,
  mainActivityIcon,
} from '@/features/day/catalogDisplay';
import { contentItems } from '@/features/day/contentItems';
import { contentName } from '@/features/day/contentName';
import { ExerciseDetails } from '@/features/day/ExerciseDetails';
import { mainActivityInfo, mainActivityMoves } from '@/features/day/mainActivity';
import { PauseContentView } from '@/features/day/PauseContentView';
import { useToday } from '@/features/day/useToday';
import { formatClock, formatSeconds } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import { gapReturnPath } from './gapReturn';
import styles from './GapScreen.module.css';

/**
 * /gap/:option — a proposal for the time chosen: the pause waiting for an answer, the
 * next one done now, an extra one, or (10+ min) the main activity. Says what it earns
 * and what it changes before starting.
 */
export function GapProposalScreen() {
  const { option = '' } = useParams();
  const { date, state } = useToday();
  const { state: routerState } = useLocation();
  if (!isGapOption(option) || state.kind !== 'active') {
    return <Navigate to={ROUTES.gap} state={routerState} replace />;
  }
  return <Proposal option={option} plan={state.plan} date={date} />;
}

function Proposal({ option, plan, date }: { option: GapOption; plan: DayPlan; date: DateKey }) {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const { state: routerState } = useLocation();
  const settings = useAppStore((state) => state.settings);
  const ledger = useAppStore((state) => state.xpLedger);
  const returnBonus = useAppStore((state) => state.days[date]?.returnBonus ?? false);
  const takeGap = useAppStore((state) => state.takeGap);
  const startMain = useAppStore((state) => state.startMain);
  const [another, setAnother] = useState(0);

  const extras = plan.activities.filter((item) => item.origin === 'gap').length;
  const proposal = useMemo(
    () =>
      proposeGap(
        plan,
        option,
        clock.now(),
        {
          catalog: CATALOG,
          discomfort: settings.discomfort,
          equipment: dayEquipment(plan, settings),
          ledger,
        },
        `${date}#gap#${option}#${extras}#${another}`,
      ),
    [plan, option, settings, ledger, date, extras, another],
  );

  const top = (
    <div className={styles.top}>
      <Link
        to={ROUTES.gap}
        state={routerState}
        replace
        className={styles.back}
        aria-label={t('common.back')}
      >
        <LineIcon name="back" size={22} /> {t('gap.preview.time')}
      </Link>
      <IconButton label={t('common.close')} to={gapReturnPath(routerState)}>
        <LineIcon name="close" size={22} />
      </IconButton>
    </div>
  );
  const header = (
    <header className={styles.header}>
      <h1>{t('gap.title')}</h1>
    </header>
  );
  if (!proposal) {
    return (
      <FlowLayout top={top} header={header}>
        <p className={styles.muted}>{t('gap.none')}</p>
        <Link to={ROUTES.gap} state={routerState} replace className={styles.back}>
          <LineIcon name="back" size={22} /> {t('gap.preview.time')}
        </Link>
      </FlowLayout>
    );
  }

  const main = proposal.kind === 'main' ? mainActivityInfo(proposal.activity) : undefined;
  const content =
    proposal.kind === 'due' || proposal.kind === 'main' ? proposal.activity : proposal;
  const name = main ? main.name[locale] : contentName(content.content, locale);
  const outcome = outcomeOf(proposal, returnBonus);

  const start = () =>
    runScreenTransition(() => {
      if (proposal.kind === 'main') {
        if (!isMainRunning(proposal.activity)) startMain(date, proposal.activity.id);
        navigate(mainPath(proposal.activity.id));
        return;
      }
      const id = takeGap(date, option, proposal);
      if (id) navigate(pausePlayPath(id));
    });

  const items = contentItems(content.content);
  const moves = main ? mainActivityMoves(main) : items.map(({ exercise }) => exercise);
  const areas = [...new Set(main ? main.areas : items.flatMap(({ exercise }) => exercise.areas))];
  const equipment = [
    ...new Set(main ? main.equipment : items.flatMap(({ exercise }) => exercise.equipment)),
  ];
  const duration = formatSeconds(content.durationSec);
  const selectedSeconds = { m1: 60, m3: 180, m5: 300, m10: 600 }[option];
  const mismatch =
    proposal.kind === 'due' &&
    (option === 'm10'
      ? content.durationSec < selectedSeconds
      : content.durationSec !== selectedSeconds);
  const noXp = proposal.kind === 'extra' && proposal.noXp;

  return (
    <FlowLayout
      top={top}
      header={header}
      footer={
        <div className={styles.actions}>
          <Button size="lg" fullWidth onClick={start}>
            {proposal.kind === 'main' && proposal.activity.startedAt !== undefined
              ? t('gap.resume')
              : t('gap.start')}
            <LineIcon name="chevron-right" size={18} />
          </Button>
          {(proposal.kind === 'advance' || proposal.kind === 'extra') && (
            <Button
              variant="ghost"
              className={styles.another}
              fullWidth
              onClick={() => setAnother((count) => count + 1)}
            >
              {t('gap.another')}
            </Button>
          )}
        </div>
      }
    >
      <Card as="section" className={styles.hero} aria-labelledby="gap-proposal-title">
        <span className={styles.kicker}>{t(`gap.preview.kinds.${proposal.kind}`)}</span>
        <h2 id="gap-proposal-title">{name}</h2>
        <strong className={styles.duration}>{duration}</strong>
        {moves.length > 0 ? (
          // What to do, moving: each move in turn. Tapping it pauses the preview.
          <div className={`${styles.art} ${styles.preview}`}>
            <MovesPreview exercises={moves} />
          </div>
        ) : (
          // A main activity without moves (a walk): its icon.
          <span className={styles.art} aria-hidden="true">
            {main && (
              <PixelIcon
                name={mainActivityIcon(main.id)}
                size={48}
                className={styles.activityArt}
              />
            )}
          </span>
        )}
        {!main && <span className={styles.window} aria-hidden="true" />}
      </Card>

      <dl className={styles.metadata}>
        {areas.length > 0 && (
          <div>
            <dt>{t('gap.preview.areas')}</dt>
            <dd>
              {areas.map((area) => (
                <span key={area}>
                  <PixelIcon name={areaIcon(area)} size={24} /> {areaName(area, locale)}
                </span>
              ))}
            </dd>
          </div>
        )}
        <div>
          <dt>{t('gap.preview.equipment')}</dt>
          <dd>
            {equipment.length > 0
              ? equipment.map((gear) => (
                  <span key={gear}>
                    <PixelIcon name={equipmentIcon(gear)} size={24} /> {equipmentName(gear, locale)}
                  </span>
                ))
              : t('gap.preview.noEquipment')}
          </dd>
        </div>
      </dl>

      <section className={styles.outcome} aria-label={t('gap.preview.effect')}>
        <PixelIcon name={noXp ? 'extra' : 'xp'} size={32} />
        <div className={styles.outcomeTexts}>
          <strong>
            {noXp
              ? t('gap.extraNoXp')
              : `${t('gap.xp', { xp: outcome.xp })} · ${t(`gap.outcomes.${proposal.kind}.xp`)}`}
          </strong>
          {noXp ? (
            <p>{t(`gap.noXpWhy.${noXp}`, { count: GAP.extraXpDailyCap ?? 0 })}</p>
          ) : (
            <>
              {proposal.kind !== 'main' && (
                <p>
                  {t(`gap.outcomes.${proposal.kind}.title`, {
                    time: outcome.time,
                  })}
                </p>
              )}
              <p>
                {t(`gap.outcomes.${proposal.kind}.body`, {
                  time: outcome.time,
                })}
              </p>
            </>
          )}
          {mismatch && (
            <p>
              {t('gap.preview.selectedTime', {
                selected: t(`gap.options.${option}.title`),
                duration,
              })}
            </p>
          )}
        </div>
      </section>

      <section className={styles.instructions}>
        <h2>{t(!main && items.length > 1 ? 'gap.preview.moves' : 'pause.howTo')}</h2>
        {main ? (
          <ExerciseDetails exercise={main} />
        ) : (
          <PauseContentView
            key={`${name}-${another}`}
            content={content.content}
            slot={content.slot}
            collapsible
          />
        )}
      </section>
    </FlowLayout>
  );
}

/** What it earns on completion, including a return bonus, and the pause's time. */
function outcomeOf(proposal: GapProposal, returnBonus: boolean): { xp: number; time: string } {
  const bonus = returnBonus ? XP.returnMultiplier : 1;
  switch (proposal.kind) {
    case 'due':
      return {
        xp: Math.round(XP.microbreak * bonus),
        time: formatClock(proposal.activity.currentScheduledAt),
      };
    case 'advance':
      return {
        xp: Math.round(XP.microbreak * bonus),
        time: formatClock(proposal.target.currentScheduledAt),
      };
    case 'main':
      return { xp: Math.round(XP.mainActivity * bonus), time: '' };
    case 'extra':
      return { xp: XP.extraBreak, time: '' };
  }
}
