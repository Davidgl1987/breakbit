import { Navigate, useParams } from 'react-router';
import { pausePath, ROUTES } from '@/app/routes';
import { CompletionView } from '@/features/day/CompletionView';
import { useT } from '@/i18n/useT';
import { selectActivity } from '@/state/selectors';
import { useAppStore } from '@/state/store';

/** /pause/:id/done — the pause is done: the celebration, its XP and the day so far. */
export function DoneScreen() {
  const { id = '' } = useParams();
  const { t } = useT();
  const activity = useAppStore(selectActivity(id));
  if (!activity) return <Navigate to={ROUTES.today} replace />;
  if (activity.status !== 'completed') return <Navigate to={pausePath(id)} replace />;
  return (
    <CompletionView
      activity={activity}
      title={t('pause.done.title')}
      xpKeys={[`micro:${id}`, `first:${id}`, `extra:${id}`]}
      focus="pauses"
    />
  );
}
