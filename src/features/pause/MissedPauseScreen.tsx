import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { useToday } from '@/features/day/useToday';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './pause.module.css';

/** A stale notification should help the user find their next action without guilt. */
export function MissedPauseScreen() {
  const { t } = useT();
  const { state } = useToday();
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const active = state.kind === 'active' && !state.over;
  return (
    <FlowLayout
      top={
        <div className={styles.statusTop}>
          <Wordmark />
          <IconButton label={t('common.close')} to={ROUTES.today}>
            <LineIcon name="close" size={22} />
          </IconButton>
        </div>
      }
      header={
        <Card as="section" variant="tinted" className={styles.missedScene}>
          <p className={styles.statusKicker}>{t('special.missed.kicker')}</p>
          <h1>{t('special.missed.title')}</h1>
          <p>{t(active ? 'special.missed.body' : 'special.missed.inactiveBody')}</p>
          <div className={styles.statusAvatar}>
            <Avatar phase={phase} size="lg" framed={false} />
          </div>
        </Card>
      }
      footer={
        <>
          {active && (
            <Link
              to={ROUTES.gap}
              state={{ from: ROUTES.today }}
              replace
              className={buttonClassName({ size: 'lg', fullWidth: true })}
            >
              {t('gap.title')}
              <LineIcon name="chevron-right" size={18} />
            </Link>
          )}
          <Link
            to={ROUTES.today}
            replace
            className={
              active
                ? styles.statusBack
                : buttonClassName({ variant: 'secondary', size: 'lg', fullWidth: true })
            }
          >
            {t('pause.states.back')}
          </Link>
        </>
      }
    >
      {active && (
        <section className={styles.statusHint}>
          <h2>{t('special.missed.question')}</h2>
          <p>{t('special.missed.hint')}</p>
        </section>
      )}
    </FlowLayout>
  );
}
