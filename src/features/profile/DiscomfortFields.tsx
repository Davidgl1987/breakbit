import { BODY_AREAS, type DiscomfortLevel, type UserSettings } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { Slider05 } from '@/ui/components/Slider05/Slider05';
import { AREA_ICONS } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './profile.module.css';

type Discomfort = UserSettings['discomfort'];

/** 0–5 per area: changes the mix of exercises, never the number of pauses. */
export function DiscomfortFields({
  value,
  onChange,
}: {
  value: Discomfort;
  onChange: (discomfort: Discomfort) => void;
}) {
  const { t } = useT();
  return (
    <>
      <Card className={styles.section}>
        {BODY_AREAS.map((area) => (
          <Slider05
            key={area}
            label={t(`areas.${area}`)}
            icon={AREA_ICONS[area]}
            value={value[area]}
            onChange={(level) => onChange({ ...value, [area]: level as DiscomfortLevel })}
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
