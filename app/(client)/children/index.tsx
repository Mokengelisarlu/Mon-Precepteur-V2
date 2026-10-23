import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';

import { ChildListScreen } from '@/features/children/screens/child-list-screen';
import { routes } from '@/lib/navigation/routes';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function ChildrenRoute(): React.JSX.Element {
  const router = useRouter();
  const journeyType = useRequestDraftStore((state) => state.journeyType);
  const children = useRequestDraftStore((state) => state.children);
  const removeChild = useRequestDraftStore((state) => state.removeChild);

  useEffect(() => {
    if (journeyType !== 'child') {
      router.replace(routes.requestType);
    }
  }, [journeyType, router]);

  if (journeyType !== 'child') {
    return <></>;
  }

  return (
    <ChildListScreen
      childDrafts={children}
      onAdd={() => router.push(routes.childForm)}
      onEdit={(childId) => router.push(routes.childFormFor(childId))}
      onRemove={removeChild}
      onContinue={(childId) => router.push(routes.needsForChild(childId))}
    />
  );
}
