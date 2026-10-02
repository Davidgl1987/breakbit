import type { EvolutionPhase } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { cx } from '@/ui/cx';
import { Avatar } from '../Avatar/Avatar';
import styles from './EvolutionStrip.module.css';

const PHASES: EvolutionPhase[] = [1, 2, 3, 4, 5];

/** The five evolution phases in order, optionally highlighting the current one. */
export function EvolutionStrip({ current }: { current?: EvolutionPhase }) {
  const { t } = useT();
  return (
    <ol className={styles.strip} aria-label={t('evolution.title')}>
      {PHASES.map((phase) => {
        const name = t(`evolution.phases.p${phase}`);
        return (
          <li
            key={phase}
            className={cx(styles.phase, phase === current && styles.current)}
            aria-current={phase === current ? 'step' : undefined}
          >
            <Avatar phase={phase} size="fluid" highlighted={phase === current} />
            <span className={styles.caption}>
              <span className="visually-hidden">{t('evolution.phaseLabel', { phase, name })}</span>
              <span aria-hidden="true">{name}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
