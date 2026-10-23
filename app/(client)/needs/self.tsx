import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';

import { AdultNeedsScreen } from '@/features/request/screens/adult-needs-screen';
import { routes } from '@/lib/navigation/routes';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function SelfNeedsRoute(): React.JSX.Element {
  const router = useRouter();
  const journeyType = useRequestDraftStore((state) => state.journeyType);
  const selfNeeds = useRequestDraftStore((state) => state.selfNeeds);
  const tutorPreference = useRequestDraftStore((state) => state.tutorPreference);
  const saveNeed = useRequestDraftStore((state) => state.saveNeed);
  const removeSelfNeed = useRequestDraftStore((state) => state.removeSelfNeed);
  const setTutorPreference = useRequestDraftStore((state) => state.setTutorPreference);

  useEffect(() => {
    if (journeyType !== 'self') {
      router.replace(routes.requestType);
    }
  }, [journeyType, router]);

  if (journeyType !== 'self') {
    return <></>;
  }

  return (
    <AdultNeedsScreen
      needs={selfNeeds}
      tutorPreference={tutorPreference}
      onSaveNeed={saveNeed}
      onRemoveNeed={removeSelfNeed}
      onTutorPreferenceChange={setTutorPreference}
      onBack={() => router.replace(routes.requestType)}
      onContinue={() => router.push(routes.contact)}
    />
  );
}
