import type React from 'react';

import { NotFound, RoutePlaceholder } from '@/components/feedback';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { useRouteParam } from '@/hooks/use-route-param';

export default function ContractRoute(): React.JSX.Element {
  const notFound = useNotFoundState();
  const contractId = useRouteParam('contractId', 'contract');

  if (contractId === null) {
    return <NotFound {...notFound} testID="not-found-state" />;
  }

  return <RoutePlaceholder route={`/contract/${contractId}`} />;
}
