import type React from 'react';

import { NotFound, RoutePlaceholder } from '@/components/feedback';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { useRouteParam } from '@/hooks/use-route-param';

export default function AdminPaymentRoute(): React.JSX.Element {
  const notFound = useNotFoundState();
  const paymentId = useRouteParam('paymentId', 'payment');

  if (paymentId === null) {
    return <NotFound {...notFound} testID="not-found-state" />;
  }

  return <RoutePlaceholder route={`/admin/payment/${paymentId}`} />;
}
