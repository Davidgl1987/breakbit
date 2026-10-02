import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { toDateKey } from '@/domain/time';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { readEvents } from '@/services/eventLog';
import { exportBackup, resetAllData } from '@/state/backup';
import { useAppStore } from '@/state/store';
import { useNow } from '@/state/useNow';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { cx } from '@/ui/cx';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { ROUTES } from '../routes';
import styles from './DevPanel.module.css';
import { formatOffset, toDateTimeLocal } from './devFormat';

const MINUTE = 60_000;
const JUMPS = [
  { minutes: 5, label: '+5 min' },
  { minutes: 15, label: '+15 min' },
  { minutes: 60, labelKey: 'dev.plusHour' },
  { minutes: 1440, labelKey: 'dev.plusDay' },
] as const;

/**
 * Dev-only tools: walk through a workday with a simulated clock, inspect and export the
 * saved data, or start from scratch. Never part of production builds.
 */
export function DevPanel() {
  const { t, locale } = useT();
  const now = useNow();
  const offset = clock.offset();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState('');
  const [eventCount, setEventCount] = useState<number>();
  const [confirmReset, setConfirmReset] = useState(false);
  const counts = useAppStore(
    useShallow((state) => ({
      days: Object.keys(state.days).length,
      overrides: Object.keys(state.dayOverrides).length,
      xp: state.xpLedger.length,
    })),
  );

  useEffect(() => {
    if (!open) return;
    let active = true;
    void readEvents().then((events) => active && setEventCount(events.length));
    return () => {
      active = false;
    };
  }, [open]);

  const timeLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  const close = () => {
    setOpen(false);
    setConfirmReset(false);
  };

  const download = async () => {
    const backup = await exportBackup();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `breakbit-${toDateKey(clock.now())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await resetAllData();
    setEventCount(0);
    setConfirmReset(false);
  };

  return (
    <>
      <button
        type="button"
        className={cx(styles.trigger, offset !== 0 && styles.simulated)}
        aria-label={t('dev.open')}
        onClick={() => setOpen(true)}
      >
        <PixelIcon name="clock" size={24} />
        {offset !== 0 && <span className={styles.badge}>{timeLabel}</span>}
      </button>

      <BottomSheet open={open} onClose={close} title={t('dev.title')}>
        <section className={styles.section} aria-label={t('dev.clock')}>
          <h3 className={styles.heading}>{t('dev.clock')}</h3>
          <p className={styles.time}>{timeLabel}</p>
          <p className={styles.muted}>
            {offset === 0
              ? t('dev.realTime')
              : t('dev.simulated', { offset: formatOffset(offset) })}
          </p>
          <div className={styles.row}>
            {JUMPS.map((jump) => (
              <Button
                key={jump.minutes}
                variant="secondary"
                size="sm"
                shape="pill"
                onClick={() => clock.setOffset(clock.offset() + jump.minutes * MINUTE)}
              >
                {'label' in jump ? jump.label : t(jump.labelKey)}
              </Button>
            ))}
          </div>
          <form
            className={styles.row}
            onSubmit={(event) => {
              event.preventDefault();
              const instant = new Date(target).getTime();
              if (!Number.isNaN(instant)) clock.travelTo(instant);
            }}
          >
            <label className="visually-hidden" htmlFor="dev-travel">
              {t('dev.goTo')}
            </label>
            <input
              id="dev-travel"
              type="datetime-local"
              className={styles.input}
              value={target || toDateTimeLocal(now)}
              onChange={(event) => setTarget(event.target.value)}
            />
            <Button type="submit" size="sm">
              {t('dev.go')}
            </Button>
          </form>
          <Button
            variant="ghost"
            size="sm"
            disabled={offset === 0}
            onClick={() => clock.setOffset(0)}
          >
            {t('dev.backToNow')}
          </Button>
        </section>

        <section className={styles.section} aria-label={t('dev.data')}>
          <h3 className={styles.heading}>{t('dev.data')}</h3>
          <dl className={styles.stats}>
            <dt>{t('dev.days')}</dt>
            <dd>{counts.days}</dd>
            <dt>{t('dev.overrides')}</dt>
            <dd>{counts.overrides}</dd>
            <dt>{t('dev.xpEntries')}</dt>
            <dd>{counts.xp}</dd>
            <dt>{t('dev.events')}</dt>
            <dd>{eventCount ?? '…'}</dd>
          </dl>
          <div className={styles.row}>
            <Button variant="secondary" size="sm" onClick={() => void download()}>
              {t('dev.export')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              pressed={confirmReset}
              onClick={() => void reset()}
            >
              {confirmReset ? t('dev.confirmReset') : t('dev.reset')}
            </Button>
          </div>
          <Link
            to={ROUTES.devKit}
            onClick={close}
            className={buttonClassName({ variant: 'ghost', size: 'sm' })}
          >
            {t('dev.designSystem')}
          </Link>
        </section>
      </BottomSheet>
    </>
  );
}
