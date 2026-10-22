import type React from 'react';

import { NotFound } from '@/components/feedback';
import { useNotFoundState } from '@/hooks/use-not-found-state';
import { routes } from '@/lib/navigation/routes';

export default function NotFoundRoute(): React.JSX.Element {
  const notFound = useNotFoundState({
    actionLabelKey: 'common.backHome',
    actionHref: routes.welcome,
  });

  return <NotFound {...notFound} testID="not-found-state" />;
}
