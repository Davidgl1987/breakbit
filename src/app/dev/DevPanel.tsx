import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { DAY_END_LEAD_MIN } from '@/domain/config';
import { isOpen } from '@/domain/pause/window';
import { atTime, toDateKey } from '@/domain/time';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { downloadJson } from '@/services/download';
import { readEvents } from '@/services/eventLog';
import { exportBackup, resetAllData } from '@/state/backup';
import { useAppStore } from '@/state/store';
import { useNow } from '@/state/useNow';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { cx } from '@/ui/cx';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { ROUTES, weekPath } from '../routes';
import styles from './DevPanel.module.css';
import { formatOffset, toDateTimeLocal } from './devFormat';
import { HISTORY_NOW, historyScenarioState } from './historyScenario';
import { SCENARIO_NOW, SCENARIO_WEEK, weekScenarioState, type WeekScenario } from './weekScenarios';

const SCENARIOS: {
  scenario: WeekScenario | 'history';
  labelKey:
    'dev.scenarioEvolve' | 'dev.scenarioStable' | 'dev.scenarioRoom' | 'dev.scenarioHistory';
}[] = [
  { scenario: 'evolve', labelKey: 'dev.scenarioEvolve' },
  { scenario: 'stable', labelKey: 'dev.scenarioStable' },
  { scenario: 'room', labelKey: 'dev.scenarioRoom' },
  { scenario: 'history', labelKey: 'dev.scenarioHistory' },
];

const MINUTE = 60_000;
const JUMPS = [
  { minutes: 5, label: '+5 min' },
  { minutes: 15, label: '+15 min' },
  { minutes: 60, labelKey: 'dev.plusHour' },
  { minutes: 1440, labelKey: 'dev.plusDay' },
  { minutes: 10_080, labelKey: 'dev.plusWeek' },
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

  // Jump straight to the next pause (its notification) to walk through the cycle.
  const nextPauseAt = useAppStore((state) => {
    const today = state.days[toDateKey(now)]?.plan;
    return today?.activities
      .filter((item) => item.kind === 'micro' && isOpen(item) && item.currentScheduledAt > now)
      .map((item) => item.currentScheduledAt)
      .sort((a, b) => a - b)[0];
  });

  // …or to 10 min before the end of the workday, when closing it is offered.
  const dayEndAt = useAppStore((state) => {
    const today = state.days[toDateKey(now)];
    if (today?.status !== 'active' || !today.plan) return undefined;
    const at = atTime(today.date, today.plan.schedule.workEnd) - DAY_END_LEAD_MIN * MINUTE;
    return at > now ? at : undefined;
  });

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

  // Sample data for the weekly result, judged by the real engine on the Monday after.
  const navigate = useNavigate();
  const loadScenario = (scenario: WeekScenario | 'history') => {
    const state = useAppStore.getState();
    if (scenario === 'history') {
      state.replaceData(historyScenarioState(state));
      clock.travelTo(HISTORY_NOW);
      close();
      navigate(ROUTES.progress);
      return;
    }
    state.replaceData(weekScenarioState(scenario, state));
    clock.travelTo(SCENARIO_NOW);
    useAppStore.getState().evaluateWeeks(SCENARIO_NOW);
    close();
    navigate(weekPath(SCENARIO_WEEK));
  };

  const download = async () => {
    downloadJson(`breakbit-${toDateKey(clock.now())}.json`, await exportBackup());
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
            {nextPauseAt !== undefined && (
              <Button
                variant="secondary"
                size="sm"
                shape="pill"
                onClick={() => clock.travelTo(nextPauseAt)}
              >
                {t('dev.nextPause')}
              </Button>
            )}
            {dayEndAt !== undefined && (
              <Button
                variant="secondary"
                size="sm"
                shape="pill"
                onClick={() => clock.travelTo(dayEndAt)}
              >
                {t('dev.dayEnd')}
              </Button>
            )}
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

        <section className={styles.section} aria-label={t('dev.scenarios')}>
          <h3 className={styles.heading}>{t('dev.scenarios')}</h3>
          <p className={styles.muted}>{t('dev.scenariosHint')}</p>
          <div className={styles.row}>
            {SCENARIOS.map(({ scenario, labelKey }) => (
              <Button
                key={scenario}
                variant="secondary"
                size="sm"
                shape="pill"
                onClick={() => loadScenario(scenario)}
              >
                {t(labelKey)}
              </Button>
            ))}
          </div>
        </section>
      </BottomSheet>
    </>
  );
}
