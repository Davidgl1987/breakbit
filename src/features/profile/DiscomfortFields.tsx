import { CATALOG } from '@/content/catalog';
import type { DiscomfortLevel, UserSettings } from '@/domain/types';
import { areaIcon } from '@/features/day/catalogDisplay';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { Slider05 } from '@/ui/components/Slider05/Slider05';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './profile.module.css';

type Discomfort = UserSettings['discomfort'];

/** 0–5 per catalog area: changes the mix of exercises, never the number of pauses. */
export function DiscomfortFields({
  value,
  onChange,
}: {
  value: Discomfort;
  onChange: (discomfort: Discomfort) => void;
}) {
  const { t, locale } = useT();
  return (
    <>
      <Card className={styles.section}>
        {CATALOG.areas.map((area) => (
          <Slider05
            key={area.id}
            label={area.name[locale]}
            icon={areaIcon(area.id)}
            value={value[area.id] ?? 0}
            onChange={(level) => onChange({ ...value, [area.id]: level as DiscomfortLevel })}
          />
        ))}
      </Card>
      <p className={`${styles.note} ${styles.muted}`}>
        <PixelIcon name="info" size={24} />
        {t('onboarding.discomfort.note')}
      </p>
    </>
  );
}
