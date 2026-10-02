import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useT } from '@/i18n/useT';
import { cx } from '@/ui/cx';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { ROUTES } from '../routes';
import styles from './GapFab.module.css';
import { waveGeometry, type WaveOptions } from './wave';

interface Measure {
  width: number;
  height: number;
  options: WaveOptions;
}

/** Before the first measurement (and in non-layout environments like tests). */
const INITIAL: Measure = { width: 220, height: 52, options: { pad: 6, fillet: 14 } };

/**
 * Central floating "Tengo un hueco" action. The bottom bar's outline rises over it like
 * a wave; the wave is sized from the button's real size so it adapts to the locale and
 * to the user's font size.
 */
export function GapFab({ active }: { active: boolean }) {
  const { t } = useT();
  const slotRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLAnchorElement>(null);
  const [measure, setMeasure] = useState(INITIAL);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const fab = fabRef.current;
    if (!slot || !fab || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(slot);
      const next: Measure = {
        width: fab.offsetWidth,
        height: fab.offsetHeight,
        options: {
          pad: parseFloat(style.getPropertyValue('--fab-wave-pad')) || INITIAL.options.pad,
          fillet: parseFloat(style.getPropertyValue('--fab-wave-fillet')) || INITIAL.options.fillet,
        },
      };
      setMeasure((current) =>
        current.width === next.width &&
        current.height === next.height &&
        current.options.pad === next.options.pad &&
        current.options.fillet === next.options.fillet
          ? current
          : next,
      );
    });
    observer.observe(fab);
    return () => observer.disconnect();
  }, []);

  const wave = waveGeometry(measure.width, measure.height, measure.options);

  return (
    <div ref={slotRef} className={styles.slot}>
      <svg
        className={styles.wave}
        width={wave.width}
        height={wave.height}
        viewBox={`0 0 ${wave.width} ${wave.height}`}
        style={{ left: -wave.width / 2, top: -wave.baseline }}
        aria-hidden="true"
        focusable="false"
      >
        <path d={wave.fillPath} className={styles.waveFill} />
        <path d={wave.strokePath} className={styles.waveStroke} />
      </svg>
      <Link
        ref={fabRef}
        to={ROUTES.gap}
        aria-current={active ? 'page' : undefined}
        className={cx(styles.fab, active && styles.active)}
        style={{ top: -wave.fabLift }}
      >
        <PixelIcon name="gap" size={24} />
        <span>{t('nav.gap')}</span>
      </Link>
    </div>
  );
}
