import type React from 'react';

import { NotFound, RoutePlaceholder } from '@/components/feedback';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { useRouteParam } from '@/hooks/use-route-param';

export default function ChildNeedsRoute(): React.JSX.Element {
  const notFound = useNotFoundState();
  const childId = useRouteParam('childId', 'child');

  if (childId === null) {
    return <NotFound {...notFound} testID="not-found-state" />;
  }

  return <RoutePlaceholder route={`/needs/child/${childId}`} />;
}
