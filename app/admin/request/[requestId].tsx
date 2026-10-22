import type React from 'react';

import { NotFound, RoutePlaceholder } from '@/components/feedback';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { useRouteParam } from '@/hooks/use-route-param';

export default function AdminRequestRoute(): React.JSX.Element {
  const notFound = useNotFoundState();
  const requestId = useRouteParam('requestId', 'request');

  if (requestId === null) {
    return <NotFound {...notFound} testID="not-found-state" />;
  }

  return <RoutePlaceholder route={`/admin/request/${requestId}`} />;
}
