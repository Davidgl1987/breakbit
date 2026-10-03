import { Link } from 'react-router';
import { gapPath, ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { GAP_OPTIONS, gapMainActivity, slotNow } from '@/domain/gap/gap';
import { useToday } from '@/features/day/useToday';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './GapScreen.module.css';

/** "/gap" — "Tengo un hueco": how much time there is, for a proposal that fits. */
export function GapScreen() {
  const { t } = useT();
  const { now, state } = useToday();
  const phase = useAppStore((store) => store.progress.evolutionPhase);
  const equipment = useAppStore((store) => store.settings.equipment);
  // Only when 10+ minutes would really propose it.
  const mainPending =
    state.kind === 'active' &&
    gapMainActivity(state.plan, slotNow(state.plan, now), { catalog: CATALOG, equipment }) !==
      undefined;

  return (
    <>
      <ScreenHeader title={t('gap.title')} subtitle={t('gap.subtitle')} />
      <AvatarStage phase={phase} pose="cheer" label={t('gap.stage')}>
        <p className={styles.bubble}>{t('gap.bubble')}</p>
      </AvatarStage>

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
    </>
  );
}
