import type { ReactNode } from 'react';
import type { EvolutionPhase } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { Stepper } from '@/ui/components/Stepper/Stepper';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './OnboardingStep.module.css';
import {
  ONBOARDING_STEPS,
  onboardingPath,
  previousStep,
  stepIndex,
  type OnboardingStepId,
} from './steps';

interface OnboardingStepProps {
  step: OnboardingStepId;
  title: string;
  subtitle?: string;
  /** Shown next to the title instead of the step's avatar. */
  trailing?: ReactNode;
  children: ReactNode;
  action: { label: string; onClick: () => void; disabled?: boolean };
}

/**
 * Shared frame of steps 2–6: back + progress, title, content, sticky main action. Each
 * step shows the next stage of the avatar giving a thumbs up (the welcome shows them all):
 * step 2 the first ancestor, the last step the most evolved one.
 */
export function OnboardingStep({
  step,
  title,
  subtitle,
  trailing,
  children,
  action,
}: OnboardingStepProps) {
  const { t } = useT();
  const back = previousStep(step);
  return (
    <FlowLayout
      top={
        <>
          {back && (
            <IconButton label={t('common.back')} to={onboardingPath(back)}>
              <LineIcon name="chevron-left" size={24} />
            </IconButton>
          )}
          <div className={styles.progress}>
            <Stepper current={stepIndex(step) + 1} total={ONBOARDING_STEPS.length} />
          </div>
        </>
      }
      header={
        <ScreenHeader
          title={title}
          subtitle={subtitle}
          trailing={
            trailing ?? (
              <Avatar phase={stepIndex(step) as EvolutionPhase} pose="thumbs_up" size="sm" />
            )
          }
        />
      }
      footer={
        <Button size="lg" fullWidth disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </Button>
      }
    >
      {children}
    </FlowLayout>
  );
}
