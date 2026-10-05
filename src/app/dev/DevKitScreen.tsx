import { useState, type ReactNode } from 'react';
import { areaName, equipmentName } from '@/features/day/catalogDisplay';
import { LOCALES, weekdayName, type Locale } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore, type ThemePreference } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Card } from '@/ui/components/Card/Card';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { ChipGroup } from '@/ui/components/ChipGroup/ChipGroup';
import { MultiChipGroup } from '@/ui/components/ChipGroup/MultiChipGroup';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { MetricTile } from '@/ui/components/MetricTile/MetricTile';
import { OptionList } from '@/ui/components/OptionList/OptionList';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { ProgressRing } from '@/ui/components/ProgressRing/ProgressRing';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { SegmentedControl } from '@/ui/components/SegmentedControl/SegmentedControl';
import { SegmentedProgress } from '@/ui/components/SegmentedProgress/SegmentedProgress';
import { Slider05 } from '@/ui/components/Slider05/Slider05';
import { StatusBadge, type BadgeStatus } from '@/ui/components/StatusBadge/StatusBadge';
import { Stepper } from '@/ui/components/Stepper/Stepper';
import { Tag } from '@/ui/components/Tag/Tag';
import { Toast } from '@/ui/components/Toast/Toast';
import { TimeField } from '@/ui/components/TimeField/TimeField';
import { Toggle } from '@/ui/components/Toggle/Toggle';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { AvatarCard } from '@/ui/game/AvatarCard/AvatarCard';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { Celebration } from '@/ui/game/Celebration/Celebration';
import { Heatmap } from '@/ui/game/Heatmap/Heatmap';
import { RoomScene } from '@/ui/game/RoomScene/RoomScene';
import { roomItemIcon } from '@/ui/icons/domainIcons';
import { ROOM_ITEMS } from '@/content/roomItems';
import { EvolutionStrip } from '@/ui/game/EvolutionStrip/EvolutionStrip';
import type { ButtonVariant } from '@/ui/components/Button/buttonStyles';
import { ICON_NAMES } from '@/ui/icons/iconNames';
import { LineIcon, type LineIconName } from '@/ui/icons/LineIcon';
import { PixelIcon, type PixelIconSize } from '@/ui/icons/PixelIcon';
import styles from './DevKitScreen.module.css';

const SWATCHES = [
  'bg',
  'surface',
  'surface-muted',
  'border',
  'text',
  'text-muted',
  'primary',
  'primary-soft',
  'danger',
  'danger-soft',
  'warning',
  'extra',
  'extra-soft',
  'nav',
  'control-track',
] as const;

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'destructive'];
const VARIANT_LABEL = {
  primary: 'startDay',
  secondary: 'changeActivity',
  ghost: 'seeMore',
  destructive: 'discardPause',
} as const;
const POSTPONE = [5, 10, 15];
const BADGES: BadgeStatus[] = [
  'pending',
  'completed',
  'postponed',
  'missed',
  'skipped',
  'firstTry',
  'extra',
];
const LINE_ICONS: LineIconName[] = [
  'chevron-left',
  'chevron-right',
  'chevron-down',
  'back',
  'close',
  'check',
  'play',
  'pause',
];
const ICON_SIZES = ['16', '24', '32', '48'] as const;
const THEMES: ThemePreference[] = ['light', 'dark', 'system'];
const WEEKDAYS = ['1', '2', '3', '4', '5', '6', '7'] as const;

/** Dev-only living style guide, to compare against docs/references. */
export function DevKitScreen() {
  const { t } = useT();
  const theme = useAppStore((state) => state.prefs.theme);
  const locale = useAppStore((state) => state.prefs.locale);
  const setTheme = useAppStore((state) => state.setTheme);
  const setLocale = useAppStore((state) => state.setLocale);

  const [intensity, setIntensity] = useState<'soft' | 'normal' | 'active'>('normal');
  const [duration, setDuration] = useState<'30s' | '1m' | '3m' | '10m'>('1m');
  const [times, setTimes] = useState({
    start: '08:30',
    end: '17:00',
    break: '11:00',
    lunch: '14:00',
  });
  const [reminders, setReminders] = useState(true);
  const [canMove, setCanMove] = useState(true);
  const [useForMain, setUseForMain] = useState(false);
  const [neck, setNeck] = useState(2);
  const [eyes, setEyes] = useState(4);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [workDays, setWorkDays] = useState<(typeof WEEKDAYS)[number][]>(['1', '2', '3', '4', '5']);
  const [gap, setGap] = useState<'s30' | 'm1' | 'm3'>('m1');
  const [iconSize, setIconSize] = useState<(typeof ICON_SIZES)[number]>('32');

  return (
    <>
      <ScreenHeader title={t('kit.title')} subtitle={t('kit.subtitle')} />

      <div className={styles.toolbar}>
        <SegmentedControl
          label={t('kit.themeLabel')}
          value={theme}
          onChange={setTheme}
          options={THEMES.map((value) => ({ value, label: t(`settings.theme.${value}`) }))}
        />
        <SegmentedControl<Locale>
          label={t('kit.localeLabel')}
          value={locale}
          onChange={setLocale}
          options={LOCALES.map((value) => ({ value, label: value.toUpperCase() }))}
        />
      </div>

      <Section title={t('kit.sections.colors')}>
        <div className={styles.swatches}>
          {SWATCHES.map((token) => (
            <div key={token} className={styles.swatch}>
              <span
                className={styles.swatchColor}
                style={{ background: `var(--color-${token})` }}
              />
              <code>{token}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('kit.sections.typography')}>
        <h1>Breakbit · Display</h1>
        <h2>{t('gap.title')}</h2>
        <h3>{t('kit.sample.nextPause')}</h3>
        <p>{t('kit.sample.goodJobBody')}</p>
        <p className={styles.muted}>{t('kit.sample.timeLeftBody')}</p>
      </Section>

      <Section title={t('kit.sections.buttons')}>
        <div className={styles.matrix}>
          <span />
          <span className={styles.colHead}>{t('kit.states.normal')}</span>
          <span className={styles.colHead}>{t('kit.states.active')}</span>
          <span className={styles.colHead}>{t('kit.states.disabled')}</span>
          {VARIANTS.map((variant) => (
            <ButtonRow
              key={variant}
              variant={variant}
              label={t(`kit.sample.${VARIANT_LABEL[variant]}`)}
            >
              {t(`kit.variants.${variant}`)}
            </ButtonRow>
          ))}
        </div>
        <Button variant="primary" size="lg" fullWidth iconEnd={<LineIcon name="chevron-right" />}>
          {t('kit.sample.startDay')}
        </Button>
      </Section>

      <Section title={t('kit.sections.pills')}>
        <div className={styles.pillRows}>
          <div className={styles.row}>
            {POSTPONE.map((minutes) => (
              <Button key={minutes} variant="secondary" size="sm" shape="pill">
                +{t('common.minutes', { count: minutes })}
              </Button>
            ))}
          </div>
          <div className={styles.row}>
            {POSTPONE.map((minutes, index) => (
              <Button
                key={minutes}
                variant={index === 0 ? 'primary' : 'secondary'}
                pressed={index === 0}
                size="sm"
                shape="pill"
              >
                +{t('common.minutes', { count: minutes })}
              </Button>
            ))}
          </div>
          <div className={styles.row}>
            {POSTPONE.map((minutes) => (
              <Button key={minutes} variant="secondary" size="sm" shape="pill" disabled>
                +{t('common.minutes', { count: minutes })}
              </Button>
            ))}
          </div>
        </div>
      </Section>

      <Section title={t('kit.sections.chips')}>
        <ChipGroup
          label={t('intensity.label')}
          showLabel
          fill
          value={intensity}
          onChange={setIntensity}
          options={[
            { value: 'soft', label: t('intensity.soft') },
            { value: 'normal', label: t('intensity.normal') },
            { value: 'active', label: t('intensity.active') },
          ]}
        />
        <ChipGroup
          label={t('kit.sample.pauseDuration')}
          showLabel
          fill
          value={duration}
          onChange={setDuration}
          options={[
            { value: '30s', label: t('common.seconds', { count: 30 }) },
            { value: '1m', label: t('common.minutes', { count: 1 }) },
            { value: '3m', label: t('common.minutes', { count: 3 }) },
            { value: '10m', label: `${t('common.minutes', { count: 10 })}+` },
          ]}
        />
        <OptionList
          label={t('gap.subtitle')}
          value={gap}
          onChange={setGap}
          options={(['s30', 'm1', 'm3'] as const).map((value) => ({
            value,
            label: t(`gap.options.${value}.title`),
            description: t(`gap.options.${value}.body`),
            icon: value === 's30' ? 'gap' : value === 'm1' ? 'stretch' : 'exercise',
          }))}
        />
        <MultiChipGroup
          label={t('onboarding.schedule.workDays')}
          showLabel
          fill
          values={workDays}
          onChange={setWorkDays}
          options={WEEKDAYS.map((day) => ({
            value: day,
            label: weekdayName(locale, Number(day), 'narrow'),
            ariaLabel: weekdayName(locale, Number(day), 'long'),
          }))}
        />
      </Section>

      <Section title={t('kit.sections.time')}>
        <div className={styles.grid2}>
          <TimeField
            label={t('schedule.start')}
            icon="play"
            value={times.start}
            onChange={(start) => setTimes((current) => ({ ...current, start }))}
          />
          <TimeField
            label={t('schedule.end')}
            icon="stop"
            value={times.end}
            onChange={(end) => setTimes((current) => ({ ...current, end }))}
          />
          <TimeField
            label={t('schedule.break')}
            icon="mug"
            value={times.break}
            onChange={(value) => setTimes((current) => ({ ...current, break: value }))}
          />
          <TimeField
            label={t('schedule.lunch')}
            icon="food"
            value={times.lunch}
            onChange={(lunch) => setTimes((current) => ({ ...current, lunch }))}
          />
        </div>
      </Section>

      <Section title={t('kit.sections.toggles')}>
        <Toggle
          checked={reminders}
          onChange={setReminders}
          label={reminders ? t('kit.sample.remindersOn') : t('kit.sample.remindersOff')}
        />
        <Toggle
          checked={!reminders}
          onChange={(checked) => setReminders(!checked)}
          labelPosition="start"
          label={t('settings.notifications')}
        />
        <Checkbox checked={canMove} onChange={setCanMove} label={t('kit.sample.canMove')} />
        <Checkbox
          checked={useForMain}
          onChange={setUseForMain}
          label={t('kit.sample.useForMain')}
        />
      </Section>

      <Section title={t('kit.sections.sliders')}>
        <Slider05 label={areaName('neck', locale)} icon="neck" value={neck} onChange={setNeck} />
        <Slider05 label={areaName('eyes', locale)} icon="eyes" value={eyes} onChange={setEyes} />
      </Section>

      <Section title={t('kit.sections.cards')}>
        <Card className={styles.cardRow}>
          <PixelIcon name="success" size={48} />
          <div>
            <h3>{t('kit.sample.goodJob')}</h3>
            <p className={styles.muted}>{t('kit.sample.goodJobBody')}</p>
          </div>
        </Card>
        <Card variant="compact" className={styles.cardRow}>
          <PixelIcon name="clock" size={32} />
          <div>
            <span className={styles.muted}>{t('kit.sample.timeLeft')}</span>
            <h3>{t('kit.sample.timeLeftValue')}</h3>
            <span className={styles.muted}>{t('kit.sample.timeLeftBody')}</span>
          </div>
        </Card>
        <div className={styles.grid2}>
          <MetricTile icon="xp" value="28" label={t('kit.sample.pausesThisWeek')} />
          <MetricTile icon="progress" value="71%" label={t('kit.sample.atFirstTry')} />
        </div>
        <div className={styles.grid2}>
          <MetricTile layout="inline" icon="shoes" value="5/6" label={t('nav.today')} />
          <MetricTile layout="inline" icon="goal" value="4" label={t('kit.sample.atFirstTry')} />
        </div>
        <ListRow
          leading={<PixelIcon name="exercise" size={48} />}
          title={t('kit.sample.nextPauseName')}
          subtitle={`${t('kit.sample.nextPause')} · ${t('common.seconds', { count: 45 })}`}
          onClick={() => {}}
        />
        <Card variant="tinted">
          <p>{t('common.comingSoon')}</p>
        </Card>
      </Section>

      <Section title={t('kit.sections.progress')}>
        <div className={styles.levelRow}>
          <PixelIcon name="xp" size={32} />
          <div className={styles.levelTexts}>
            <strong>{t('kit.sample.level', { level: 3 })}</strong>
            <ProgressBar value={320} max={1000} label={t('kit.sample.level', { level: 3 })} />
            <span className={styles.muted}>
              {t('kit.sample.xpOf', { current: 320, total: '1.000' })}
            </span>
          </div>
        </div>
        <div className={styles.levelTexts}>
          <strong>{t('kit.sample.dayProgress')}</strong>
          <SegmentedProgress
            done={6}
            total={8}
            label={t('common.pausesOf', { done: 6, total: 8 })}
          />
          <span className={styles.muted}>{t('common.pausesOf', { done: 6, total: 8 })}</span>
        </div>
        <Stepper current={1} total={5} />
        <div className={styles.row}>
          <ProgressRing progress={0.35} label={t('pause.timer')} size={140}>
            <strong>0:26</strong>
          </ProgressRing>
        </div>
        <div className={styles.badges}>
          {BADGES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </Section>

      <Section title={t('kit.sections.messages')}>
        <InlineMessage icon="info">{t('kit.sample.hint')}</InlineMessage>
        <InlineMessage tone="danger">{t('schedule.issues.overlap')}</InlineMessage>
        <Toast
          message={t('toasts.postponed', { time: '10:15' })}
          closeLabel={t('toasts.close')}
          onClose={() => {}}
        />
        <Toast
          message={t('toasts.discarded')}
          tone="warning"
          closeLabel={t('toasts.close')}
          onClose={() => {}}
        />
      </Section>

      <Section title={t('kit.sections.tags')}>
        <div className={styles.row}>
          <Tag icon="neck">{areaName('neck', locale)}</Tag>
          <Tag icon="dumbbell">{equipmentName('dumbbells', locale)}</Tag>
          <Tag>{t('intensity.normal')}</Tag>
        </div>
      </Section>

      <Section title={t('kit.sections.avatar')}>
        <div className={styles.row}>
          <Avatar phase={1} size="sm" />
          <Avatar phase={3} size="md" />
          <Avatar phase={5} pose="thumbs_up" size="lg" highlighted />
        </div>
        <EvolutionStrip />
        <AvatarStage phase={5} pose="demo" label={t('pause.demo')} />
        <AvatarStage phase={3} pose="celebrate" label={t('pause.done.stage')}>
          <Celebration />
        </AvatarStage>
        <AvatarCard
          phase={3}
          streak={7}
          xpToday={120}
          level={{ level: 3, current: 320, needed: 1000 }}
        />
        <Heatmap
          label={t('progress.heatmap.title')}
          dayLabels={['L', '', 'X', '', 'V', '', '']}
          weeks={Array.from({ length: 12 }, (_, week) => ({
            key: `w${week}`,
            days: Array.from({ length: 7 }, (_, day) => ({
              key: `w${week}d${day}`,
              level: day >= 5 ? ('off' as const) : (((week + day) % 5) as 0 | 1 | 2 | 3 | 4),
            })),
          }))}
          legend={{
            less: t('progress.heatmap.less'),
            more: t('progress.heatmap.more'),
            off: t('progress.heatmap.off'),
          }}
        />
        <RoomScene
          label={t('week.room')}
          items={ROOM_ITEMS.slice(0, 4).map((item) => ({
            id: item.id,
            name: item.name[locale],
            icon: roomItemIcon(item.id),
          }))}
          capacity={ROOM_ITEMS.length}
          highlight={ROOM_ITEMS[3]?.id}
          newLabel={t('week.new')}
        />
      </Section>

      <Section title={t('kit.sections.lists')}>
        <ListRow
          leading={<PixelIcon name="reading" size={24} />}
          title={t('settings.language')}
          trailing={t(`settings.languages.${locale}`)}
          onClick={() => {}}
        />
        <ListRow
          leading={<PixelIcon name="neck" size={32} />}
          title={t('settings.discomfort')}
          subtitle={['neck', 'eyes', 'shoulders'].map((area) => areaName(area, locale)).join(', ')}
          onClick={() => {}}
        />
      </Section>

      <Section title={t('kit.sections.sheet')}>
        <Button variant="ghost" onClick={() => setSheetOpen(true)}>
          {t('kit.sample.openSheet')}
        </Button>
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t('kit.sample.sheetTitle')}
          actions={
            <>
              <Button variant="destructive" fullWidth onClick={() => setSheetOpen(false)}>
                {t('kit.sample.discardPause')} · −50 XP
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setSheetOpen(false)}>
                {t('kit.sample.cancel')}
              </Button>
            </>
          }
        >
          <p>{t('kit.sample.sheetBody')}</p>
        </BottomSheet>
      </Section>

      <Section title={t('kit.sections.icons')}>
        <ChipGroup
          label={t('kit.sample.iconSize')}
          value={iconSize}
          onChange={setIconSize}
          options={ICON_SIZES.map((value) => ({ value, label: `${value}px` }))}
        />
        <div className={styles.icons}>
          {ICON_NAMES.map((name) => (
            <figure key={name} className={styles.icon}>
              <PixelIcon name={name} size={Number(iconSize) as PixelIconSize} />
              <figcaption>{name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title={t('kit.sections.lineIcons')}>
        <div className={styles.row}>
          {LINE_ICONS.map((name) => (
            <span key={name} className={styles.lineIcon} title={name}>
              <LineIcon name={name} size={24} />
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card as="section" className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </Card>
  );
}

function ButtonRow({
  variant,
  label,
  children,
}: {
  variant: ButtonVariant;
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <span className={styles.rowHead}>{children}</span>
      <Button variant={variant} size="sm" fullWidth className={styles.wrapText}>
        {label}
      </Button>
      <Button variant={variant} size="sm" fullWidth pressed className={styles.wrapText}>
        {label}
      </Button>
      <Button variant={variant} size="sm" fullWidth disabled className={styles.wrapText}>
        {label}
      </Button>
    </>
  );
}
