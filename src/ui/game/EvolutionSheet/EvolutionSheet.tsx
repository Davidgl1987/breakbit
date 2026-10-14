import type { ReactNode } from 'react';
import type { EvolutionPhase } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Avatar } from '../Avatar/Avatar';
import styles from './EvolutionSheet.module.css';

const PHASES: EvolutionPhase[] = [1, 2, 3, 4, 5];

/** The avatar's five phases, revealed on demand in the shared bottom sheet. */
export function EvolutionSheet({
  phase,
  onClose,
  children,
}: {
  phase: EvolutionPhase;
  onClose: () => void;
  children?: ReactNode;
}) {
  const { t } = useT();
  return (
    <BottomSheet open onClose={onClose} title={t('evolution.title')}>
      <p className={styles.caption}>{t('evolution.caption')}</p>
      <ol className={styles.list} aria-label={t('evolution.title')}>
        {PHASES.map((item) => (
          <li key={item} aria-current={item === phase ? 'step' : undefined}>
            <Avatar phase={item} size="sm" framed={false} />
            <div>
              <span className={styles.caption}>{t('week.design.phase', { phase: item })}</span>
              <strong>{t(`evolution.phases.p${item}`)}</strong>
            </div>
            {item === phase && <span className={styles.current}>{t('week.design.now')}</span>}
          </li>
        ))}
      </ol>
      {children}
    </BottomSheet>
  );
}
