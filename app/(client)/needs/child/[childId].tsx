import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';

import { NotFound } from '@/components/feedback';
import { ChildNeedsScreen } from '@/features/request/screens/child-needs-screen';
import { routes } from '@/lib/navigation/routes';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { useRouteParam } from '@/hooks/use-route-param';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function ChildNeedsRoute(): React.JSX.Element {
  const router = useRouter();
  const notFound = useNotFoundState({ actionHref: routes.children });
  const childId = useRouteParam('childId', 'child');
  const journeyType = useRequestDraftStore((state) => state.journeyType);
  const children = useRequestDraftStore((state) => state.children);
  const needsByChildId = useRequestDraftStore((state) => state.needsByChildId);
  const tutorPreference = useRequestDraftStore((state) => state.tutorPreference);
  const saveNeed = useRequestDraftStore((state) => state.saveNeed);
  const removeNeed = useRequestDraftStore((state) => state.removeNeed);
  const setTutorPreference = useRequestDraftStore((state) => state.setTutorPreference);
  const child = children.find((entry) => entry.id === childId);

  useEffect(() => {
    if (journeyType !== 'child') {
      router.replace(routes.requestType);
    }
  }, [journeyType, router]);

  if (journeyType !== 'child') {
    return <></>;
  }

  if (childId === null || child === undefined) {
    return <NotFound {...notFound} testID="not-found-state" />;
  }

  return (
    <ChildNeedsScreen
      child={child}
      needs={needsByChildId[child.id] ?? []}
      tutorPreference={tutorPreference}
      onSaveNeed={saveNeed}
      onRemoveNeed={(needId) => removeNeed(child.id, needId)}
      onTutorPreferenceChange={setTutorPreference}
      onBack={() => router.replace(routes.children)}
      onContinue={() => {
        const childIndex = children.findIndex((entry) => entry.id === child.id);
        const nextChild = children[childIndex + 1];
        if (nextChild === undefined) {
          router.push(routes.contact);
          return;
        }
        router.push(routes.needsForChild(nextChild.id));
      }}
    />
  );
}
