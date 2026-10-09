import { Navigate, useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/app/routes';
import { AboutSection } from './AboutSection';
import { SettingsScreen } from './SettingsScreen';
import type { RoutineSection } from './SettingsEditSheet';
export type SettingsSection = RoutineSection | 'about';
const SECTIONS = ['schedule', 'discomfort', 'equipment', 'intensity', 'about'] as const;
export function SettingsSectionScreen() {
  const { section = '' } = useParams();
  const navigate = useNavigate();
  if (!(SECTIONS as readonly string[]).includes(section))
    return <Navigate to={ROUTES.settings} replace />;
  return section === 'about' ? (
    <AboutSection />
  ) : (
    <SettingsScreen
      initialSection={section as RoutineSection}
      onCloseSection={() => navigate(ROUTES.settings)}
    />
  );
}
