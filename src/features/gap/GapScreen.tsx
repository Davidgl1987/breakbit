import { Link, useLocation, useNavigate } from 'react-router';
import { gapPath, ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { dayEquipment } from '@/domain/day/today';
import { GAP_OPTIONS, gapMainActivity, slotNow } from '@/domain/gap/gap';
import { DaySceneCard } from '@/features/day/DaySceneCard';
import { useToday } from '@/features/day/useToday';
import { formatActiveTime, formatSeconds } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { LineIcon } from '@/ui/icons/LineIcon';
import { gapReturnPath } from './gapReturn';
import styles from './GapScreen.module.css';

/** Time choice over the current tab; a distinct scene when there is no active workday. */
export function GapScreen() {
  const { t } = useT();
  const navigate = useNavigate();
  const { state: routerState } = useLocation();
  const { now, date, state } = useToday();
  const settings = useAppStore((store) => store.settings);
  const summary = useAppStore((store) => store.days[date]?.summary);
  const close = () => navigate(gapReturnPath(routerState), { replace: true });

  if (state.kind === 'active') {
    const main = gapMainActivity(state.plan, slotNow(state.plan, now), {
      catalog: CATALOG,
      equipment: dayEquipment(state.plan, settings),
    });
    return (
      <BottomSheet open title={t('gap.title')} onClose={close}>
        <div className={styles.selector}>
          <h2 className={styles.question}>{t('gap.subtitle')}</h2>
          <p className={styles.muted}>{t('gap.preview.choose')}</p>
          <div className={styles.options}>
            {GAP_OPTIONS.map((option) => (
              <Link
                key={option}
                to={gapPath(option)}
                state={routerState}
                replace
                className={styles.timeRow}
              >
                <strong>{t(`gap.options.${option}.title`)}</strong>
                <span>
                  {option === 'm10' && main
                    ? t('gap.preview.mainTime', {
                        duration: formatSeconds(main.durationSec),
                      })
                    : t(`gap.options.${option}.body`)}
                </span>
                <LineIcon name="chevron-right" size={18} />
              </Link>
            ))}
          </div>
          <p className={styles.note}>{t('gap.preview.context')}</p>
        </div>
      </BottomSheet>
    );
  }

  const kind =
    state.kind === 'not_started' ? 'before' : state.kind === 'closed' ? 'closed' : 'rest';
  return (
    <FlowLayout
      top={
        <IconButton label={t('common.close')} to={gapReturnPath(routerState)}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={
        <header className={styles.header}>
          <h1>{t('gap.title')}</h1>
        </header>
      }
    >
      <DaySceneCard
        kicker={t(`gap.preview.${kind}.kicker`)}
        title={t(`gap.preview.${kind}.title`)}
        pose={kind === 'before' ? 'sleep' : kind === 'closed' ? 'celebrate' : 'rest'}
        footer={
          <Link
            to={kind === 'closed' ? ROUTES.today : ROUTES.dayStart}
            className={buttonClassName({ fullWidth: true, size: 'lg' })}
          >
            {t(`gap.preview.${kind}.action`)} <LineIcon name="chevron-right" size={18} />
          </Link>
        }
      >
        <p>{t(`gap.preview.${kind}.body`)}</p>
      </DaySceneCard>
      {kind === 'closed' && summary && (
        <dl className={styles.summary}>
          <div>
            <dt>{t('dayEnd.stats.movement')}</dt>
            <dd>{formatActiveTime(summary.movementSec)}</dd>
          </div>
          <div>
            <dt>{t('cycle.closed.pauses')}</dt>
            <dd>
              {summary.completed}/{summary.planned}
            </dd>
          </div>
        </dl>
      )}
      {kind === 'rest' && <p className={styles.note}>{t('gap.preview.rest.streak')}</p>}
    </FlowLayout>
  );
}
