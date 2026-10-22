import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import type { TranslateKey } from '@/lib/i18n';
import { routes } from '@/lib/navigation/routes';

export interface NotFoundStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export interface UseNotFoundStateOptions {
  actionLabelKey?: TranslateKey;
  actionHref?: string;
}

export function useNotFoundState(options: UseNotFoundStateOptions = {}): NotFoundStateProps {
  const { t } = useTranslation();
  const router = useRouter();
  const { actionLabelKey = 'common.backToDashboard', actionHref = routes.dashboard } = options;

  const onAction = useCallback(() => {
    router.replace(actionHref);
  }, [actionHref, router]);

  return {
    title: t('error.notFoundTitle'),
    description: t('error.notFound'),
    actionLabel: t(actionLabelKey),
    onAction,
  };
}
