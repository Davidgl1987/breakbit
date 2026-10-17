import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import type { ExerciseGuide as Guide, ExerciseGuideFrame } from '@/assets/exerciseGuides';
import { EXERCISE_AVATAR } from '@/assets/exerciseGuides';
import { useT } from '@/i18n/useT';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './ExerciseGuide.module.css';

const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (listener: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};
const reducedMotion = () => window.matchMedia(motionQuery).matches;
const subscribeVisibility = (listener: () => void) => {
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
};
const pageVisible = () => document.visibilityState === 'visible';

/** Coordinates are percentages of the square image, so the gaze follows its scale. */
export function GuideGazeArrow({
  gazeLine,
}: {
  gazeLine: NonNullable<ExerciseGuideFrame['gazeLine']>;
}) {
  const arrowId = useId();
  const [x1, y1] = gazeLine.from;
  const [x2, y2] = gazeLine.to;
  return (
    <svg className={styles.gazeArrow} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 6 6"
          refX="5"
          refY="3"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0 0L6 3L0 6Z" fill="currentColor" />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-bg)" strokeWidth="2.6" />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeDasharray="2 1.5"
        markerEnd={`url(#${arrowId})`}
      />
    </svg>
  );
}

/** Decorative directions supplement the localized instruction, outside the illustration. */
function GuideCue({ cue }: { cue: NonNullable<ExerciseGuideFrame['cue']> }) {
  return (
    <span className={styles.cue} aria-hidden="true">
      <svg
        viewBox="0 0 24 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {cue === 'horizontal' && <path d="M3 9h18M3 9l4-4M3 9l4 4M21 9l-4-4M21 9l-4 4" />}
        {cue === 'vertical' && <path d="M12 2v14M12 2l-4 4M12 2l4 4M12 16l-4-4M12 16l4-4" />}
        {cue === 'circles' && (
          <path d="M4 7a8 6 0 0 1 14-3l2 2M20 6V2M20 11a8 6 0 0 1-14 3l-2-2M4 12v4" />
        )}
        {(cue === 'near' || cue === 'far') && (
          <>
            <path d="M10 9h4" />
            <circle cx="5" cy="9" r="3" fill={cue === 'near' ? 'currentColor' : 'none'} />
            <circle cx="19" cy="9" r="2" fill={cue === 'far' ? 'currentColor' : 'none'} />
          </>
        )}
      </svg>
    </span>
  );
}

/** Demonstration playback is independent of the exercise timer and awards no progress. */
export function ExerciseGuide({ guide }: { guide: Guide }) {
  const { t, locale } = useT();
  const captionId = useId();
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, () => true);
  const visible = useSyncExternalStore(subscribeVisibility, pageVisible, () => false);
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const [explicitPlay, setExplicitPlay] = useState(false);
  const [loaded, setLoaded] = useState<readonly string[]>([]);
  const [failed, setFailed] = useState(false);
  const index = guide.sequence[position] ?? 0;
  const frame = guide.frames[index]!;
  const ready = guide.frames.every((item) => loaded.includes(item.src));
  const automatic = !paused && (!reduce || explicitPlay);

  useEffect(() => {
    if (!automatic || !visible || !ready || failed) return;
    const timer = window.setTimeout(
      () => setPosition((value) => (value + 1) % guide.sequence.length),
      frame.durationMs,
    );
    return () => window.clearTimeout(timer);
  }, [automatic, visible, ready, failed, frame.durationMs, guide.sequence, position]);

  const move = (direction: number) => {
    setPaused(true);
    setPosition((value) => (value + direction + guide.sequence.length) % guide.sequence.length);
  };

  return (
    <section className={styles.guide} aria-label={t('exerciseGuide.title')}>
      <div className={styles.stage}>
        {failed ? (
          <img src={EXERCISE_AVATAR} alt={t('pause.demo')} draggable={false} />
        ) : (
          guide.frames.map((item, number) => (
            <img
              key={item.src}
              src={item.src}
              hidden={number !== index}
              alt={item.description[locale]}
              draggable={false}
              onLoad={() =>
                setLoaded((value) => (value.includes(item.src) ? value : [...value, item.src]))
              }
              onError={() => setFailed(true)}
            />
          ))
        )}
        {!failed && frame.gazeLine && <GuideGazeArrow gazeLine={frame.gazeLine} />}
      </div>
      {!failed && (
        <>
          <div className={styles.controls}>
            <div className={styles.navigation}>
              <IconButton label={t('exerciseGuide.previous')} onClick={() => move(-1)}>
                <LineIcon name="chevron-left" size={18} />
              </IconButton>
              <span className={styles.counter}>
                {t('exerciseGuide.position', { current: index + 1, total: guide.frames.length })}
              </span>
              <IconButton label={t('exerciseGuide.next')} onClick={() => move(1)}>
                <LineIcon name="chevron-right" size={18} />
              </IconButton>
            </div>
            <button
              type="button"
              className={styles.playback}
              onClick={() => {
                if (automatic) setPaused(true);
                else {
                  setExplicitPlay(true);
                  setPaused(false);
                }
              }}
              aria-describedby={captionId}
            >
              <LineIcon name={automatic ? 'pause' : 'play'} size={16} />
              {t(automatic ? 'exerciseGuide.pause' : 'exerciseGuide.resume')}
            </button>
          </div>
          <p id={captionId} className={styles.caption} aria-live={automatic ? 'off' : 'polite'}>
            {frame.cue && <GuideCue cue={frame.cue} />}
            {frame.description[locale]}
          </p>
        </>
      )}
    </section>
  );
}
