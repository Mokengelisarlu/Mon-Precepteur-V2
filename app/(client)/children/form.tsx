import { useLocalSearchParams, useRouter } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';

import { NotFound } from '@/components/feedback';
import { useToast } from '@/components/feedback/ToastHost';
import { ChildFormScreen } from '@/features/children/screens/child-form-screen';
import type { ChildDraftRecord } from '@/features/children/types';
import { useTranslation } from '@/hooks/use-translation';
import { isEntityId, readParam } from '@/lib/navigation/params';
import { routes } from '@/lib/navigation/routes';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function ChildFormRoute(): React.JSX.Element {
  const router = useRouter();
  const { childId: childIdParam } = useLocalSearchParams<{ childId?: string | string[] }>();
  const childId = readParam(childIdParam);
  const journeyType = useRequestDraftStore((state) => state.journeyType);
  const children = useRequestDraftStore((state) => state.children);
  const saveChild = useRequestDraftStore((state) => state.saveChild);
  const child = children.find((entry) => entry.id === childId);
  const { showToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (journeyType !== 'child') {
      router.replace(routes.requestType);
    }
  }, [journeyType, router]);

  if (journeyType !== 'child') {
    return <></>;
  }

  if (
    childId.length > 0 &&
    (!isEntityId(childId, 'child') || child === undefined)
  ) {
    return (
      <NotFound
        title={t('error.notFoundTitle')}
        description={t('error.notFound')}
        actionLabel={t('common.back')}
        onAction={() => router.back()}
        testID="child-form-not-found"
      />
    );
  }

  const handleSave = (nextChild: ChildDraftRecord, isNew: boolean) => {
    saveChild(nextChild);
    showToast({
      message: t(isNew ? 'children.added' : 'children.updated'),
      variant: 'success',
    });
    router.back();
  };

  return (
    <ChildFormScreen
      child={child}
      onCancel={() => router.back()}
      onSave={handleSave}
    />
  );
}
