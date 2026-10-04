import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { mainPath, pausePlayPath, ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { GAP, XP } from '@/domain/config';
import { isGapOption, proposeGap, type GapOption, type GapProposal } from '@/domain/gap/gap';
import { isMainRunning } from '@/domain/main/session';
import type { DateKey, DayPlan } from '@/domain/types';
import { ActivityHero } from '@/features/day/ActivityHero';
import { contentName } from '@/features/day/contentName';
import { ExerciseDetails } from '@/features/day/ExerciseDetails';
import { mainActivityInfo } from '@/features/day/mainActivity';
import { PauseContentView } from '@/features/day/PauseContentView';
import { useToday } from '@/features/day/useToday';
import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { Tag } from '@/ui/components/Tag/Tag';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import type { IconName } from '@/ui/icons/iconNames';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import styles from './GapScreen.module.css';

/** The most evolved avatar shows every exercise (one set of art for all phases). */
const DEMO_PHASE = 5;

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
          equipment: settings.equipment,
          ledger,
        },
        `${date}#gap#${option}#${extras}#${another}`,
      ),
    [plan, option, settings, ledger, date, extras, another],
  );

  const back = (
    <IconButton label={t('common.back')} to={ROUTES.gap} state={routerState}>
      <LineIcon name="back" size={22} />
    </IconButton>
  );
  if (!proposal) {
    return (
      <FlowLayout top={back} header={null}>
        <p className={styles.muted}>{t('gap.none')}</p>
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

  return (
    <FlowLayout
      top={back}
      header={
        <ActivityHero
          stage={<AvatarStage phase={DEMO_PHASE} pose="demo" label={t('pause.demo')} />}
          eyebrow={<Tag icon="clock">{t(`gap.options.${option}.proposal`)}</Tag>}
          title={name}
        />
      }
    >
      {main ? (
        <ExerciseDetails exercise={main} />
      ) : (
        <PauseContentView content={content.content} slot={content.slot} />
      )}

      {proposal.kind === 'extra' && proposal.noXp ? (
        // Still a good move: said plainly, without making it a penalty.
        <Card as="section" className={styles.outcome}>
          <PixelIcon name="extra" size={32} />
          <div className={styles.outcomeTexts}>
            <span className={styles.outcomeTitle}>{t('gap.extraNoXp')}</span>
            <span className={styles.outcomeBody}>
              {t(`gap.noXpWhy.${proposal.noXp}`, { count: GAP.extraXpDailyCap ?? 0 })}
            </span>
          </div>
        </Card>
      ) : (
        <div className={styles.outcomes}>
          <Card as="section" className={styles.outcome}>
            <PixelIcon name="xp" size={32} />
            <div className={styles.outcomeTexts}>
              <span className={styles.outcomeTitle}>{t('gap.xp', { xp: outcome.xp })}</span>
              <span className={styles.outcomeBody}>{t(`gap.outcomes.${proposal.kind}.xp`)}</span>
            </div>
          </Card>
          <Card as="section" className={styles.outcome}>
            <PixelIcon name={outcome.icon} size={32} />
            <div className={styles.outcomeTexts}>
              <span className={styles.outcomeTitle}>
                {t(`gap.outcomes.${proposal.kind}.title`, { time: outcome.time })}
              </span>
              <span className={styles.outcomeBody}>
                {t(`gap.outcomes.${proposal.kind}.body`, { time: outcome.time })}
              </span>
            </div>
          </Card>
        </div>
      )}

      <div className={styles.actions}>
        <Button size="lg" fullWidth onClick={start}>
          {proposal.kind === 'main' && proposal.activity.startedAt !== undefined
            ? t('gap.resume')
            : t('gap.start')}
        </Button>
        {(proposal.kind === 'advance' || proposal.kind === 'extra') && (
          <Button variant="ghost" fullWidth onClick={() => setAnother((count) => count + 1)}>
            {t('gap.another')}
          </Button>
        )}
      </div>
    </FlowLayout>
  );
}

/** What it earns (base XP, as the completion will count it), its icon, and the pause's time. */
function outcomeOf(
  proposal: GapProposal,
  returnBonus: boolean,
): { xp: number; icon: IconName; time: string } {
  const bonus = returnBonus ? XP.returnMultiplier : 1;
  switch (proposal.kind) {
    case 'due':
      return {
        xp: Math.round(XP.microbreak * bonus),
        icon: 'pending',
        time: formatClock(proposal.activity.currentScheduledAt),
      };
    case 'advance':
      return {
        xp: Math.round(XP.microbreak * bonus),
        icon: 'forward',
        time: formatClock(proposal.target.currentScheduledAt),
      };
    case 'main':
      return { xp: Math.round(XP.mainActivity * bonus), icon: 'goal', time: '' };
    case 'extra':
      return { xp: XP.extraBreak, icon: 'extra', time: '' };
  }
}
