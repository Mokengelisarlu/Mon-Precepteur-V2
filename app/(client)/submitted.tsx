import { useLocalSearchParams, useRouter } from 'expo-router';
import type React from 'react';

import { ErrorState } from '@/components/ui';
import { SubmittedScreen } from '@/features/request/screens/submitted-screen';
import { useTranslation } from '@/hooks/use-translation';
import { routes } from '@/lib/navigation/routes';
import { useRequestStore } from '@/store/request-store';

export default function SubmittedRoute(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requests = useRequestStore((state) => state.requests);
  const request = requests.find((entry) => entry.id === params.requestId);

  if (request === undefined) {
    return (
      <ErrorState
        title={t('error.notFoundTitle')}
        description={t('error.notFound')}
        retryLabel={t('common.backToDashboard')}
        onRetry={() => router.replace(routes.dashboard)}
        testID="submitted-not-found"
      />
    );
  }

  return (
    <SubmittedScreen
      reference={request.reference}
      onDashboard={() => router.replace(routes.dashboard)}
    />
  );
}
