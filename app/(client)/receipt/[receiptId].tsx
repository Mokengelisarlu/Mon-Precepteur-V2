import type React from 'react';

import { NotFound, RoutePlaceholder } from '@/components/feedback';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { useRouteParam } from '@/hooks/use-route-param';

export default function ReceiptRoute(): React.JSX.Element {
  const notFound = useNotFoundState();
  const receiptId = useRouteParam('receiptId', 'receipt');

  if (receiptId === null) {
    return <NotFound {...notFound} testID="not-found-state" />;
  }

  return <RoutePlaceholder route={`/receipt/${receiptId}`} />;
}
