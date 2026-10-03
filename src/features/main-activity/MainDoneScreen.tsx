import { Navigate, useParams } from 'react-router';
import { mainPath, ROUTES } from '@/app/routes';
import { CompletionView } from '@/features/day/CompletionView';
import { useT } from '@/i18n/useT';
import { activityDate, selectActivity } from '@/state/selectors';
import { useAppStore } from '@/state/store';

/** /main/:id/done — the main activity is done: the celebration, its XP and the day so far. */
export function MainDoneScreen() {
  const { id = '' } = useParams();
  const { t } = useT();
  const activity = useAppStore(selectActivity(id));
  if (!activity || activity.kind !== 'main') return <Navigate to={ROUTES.today} replace />;
  if (activity.status !== 'completed') return <Navigate to={mainPath(id)} replace />;
  return (
    <CompletionView
      activity={activity}
      title={t('main.done.title')}
      xpKeys={[`main:${activityDate(id)}`]}
      focus="main"
    />
  );
}
