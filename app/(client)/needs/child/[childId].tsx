import { Redirect } from 'expo-router';
import type React from 'react';

import { routes } from '@/lib/navigation/routes';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function ChildNeedsRoute(): React.JSX.Element {
  const journeyType = useRequestDraftStore((state) => state.journeyType);

  return <Redirect href={journeyType === 'child' ? routes.contact : routes.requestType} />;
}
