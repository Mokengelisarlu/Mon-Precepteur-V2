import type React from 'react';

import { NotFound, RoutePlaceholder } from '@/components/feedback';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { useRouteParam } from '@/hooks/use-route-param';

export default function ProposalRoute(): React.JSX.Element {
  const notFound = useNotFoundState();
  const proposalId = useRouteParam('proposalId', 'proposal');

  if (proposalId === null) {
    return <NotFound {...notFound} testID="not-found-state" />;
  }

  return <RoutePlaceholder route={`/proposal/${proposalId}`} />;
}
