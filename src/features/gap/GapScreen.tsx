import { Link, useLocation } from 'react-router';
import { gapPath, ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { GAP_OPTIONS, gapMainActivity, slotNow } from '@/domain/gap/gap';
import { ActivityHero } from '@/features/day/ActivityHero';
import { useToday } from '@/features/day/useToday';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { gapReturnPath } from './gapReturn';
import styles from './GapScreen.module.css';

/**
 * "/gap" — "Tengo un hueco": how much time there is, for a proposal that fits. A modal
 * over the tabs (it grows out of its button); closing goes back to where it was opened.
 */
export function GapScreen() {
  const { t } = useT();
  const { state: routerState } = useLocation();
  const { now, state } = useToday();
  const phase = useAppStore((store) => store.progress.evolutionPhase);
  const equipment = useAppStore((store) => store.settings.equipment);
  // Only when 10+ minutes would really propose it.
  const mainPending =
    state.kind === 'active' &&
    gapMainActivity(state.plan, slotNow(state.plan, now), { catalog: CATALOG, equipment }) !==
      undefined;

  return (
    <FlowLayout
      top={
        <IconButton label={t('common.close')} to={gapReturnPath(routerState)}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={
        <ActivityHero
          stage={
            <AvatarStage phase={phase} pose="cheer" label={t('gap.stage')}>
              <p className={styles.bubble}>{t('gap.bubble')}</p>
            </AvatarStage>
          }
          title={t('gap.title')}
          name={t('gap.subtitle')}
        />
      }
    >
      {state.kind === 'active' ? (
        <div className={styles.options}>
          {GAP_OPTIONS.map((option) => (
            <ListRow
              key={option}
              leading={<PixelIcon name="clock" size={32} />}
              title={t(`gap.options.${option}.title`)}
              subtitle={
                option === 'm10' && mainPending
                  ? t('gap.mainBody')
                  : t(`gap.options.${option}.body`)
              }
              to={gapPath(option)}
              state={routerState}
            />
          ))}
        </div>
      ) : state.kind === 'not_started' ? (
        <Card as="section" className={styles.state}>
          <h2 className={styles.stateTitle}>{t('gap.notStarted.title')}</h2>
          <p className={styles.muted}>{t('gap.notStarted.body')}</p>
          <Link to={ROUTES.dayStart} className={buttonClassName({ fullWidth: true })}>
            {t('gap.notStarted.action')}
          </Link>
        </Card>
      ) : (
        <Card as="section" className={styles.state}>
          <h2 className={styles.stateTitle}>{t('gap.noDay.title')}</h2>
          <p className={styles.muted}>{t('gap.noDay.body')}</p>
        </Card>
      )}
    </FlowLayout>
  );
}
