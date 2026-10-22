import type React from 'react';

import { NotFound, RoutePlaceholder } from '@/components/feedback';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { useRouteParam } from '@/hooks/use-route-param';

export default function InvoiceRoute(): React.JSX.Element {
  const notFound = useNotFoundState();
  const invoiceId = useRouteParam('invoiceId', 'invoice');

  if (invoiceId === null) {
    return <NotFound {...notFound} testID="not-found-state" />;
  }

  return <RoutePlaceholder route={`/invoice/${invoiceId}`} />;
}
