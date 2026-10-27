import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';

import { NotFound } from '@/components/feedback';
import { useToast } from '@/components/feedback/ToastHost';
import { ChildOnboardingScreen } from '@/features/children/screens/child-onboarding-screen';
import {
  buildChildDraftFromOnboarding,
  childToOnboardingData,
} from '@/features/children/services/child-onboarding';
import type { ChildOnboardingData } from '@/features/children/types';
import { useTranslation } from '@/hooks/use-translation';
import { isEntityId, readParam } from '@/lib/navigation/params';
import { routes } from '@/lib/navigation/routes';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function ChildrenRoute(): React.JSX.Element {
  const router = useRouter();
  const { childId: childIdParam } = useLocalSearchParams<{ childId?: string | string[] }>();
  const childId = readParam(childIdParam);
  const journeyType = useRequestDraftStore((state) => state.journeyType);
  const children = useRequestDraftStore((state) => state.children);
  const onboardingByChildId = useRequestDraftStore((state) => state.onboardingByChildId);
  const saveChild = useRequestDraftStore((state) => state.saveChild);
  const saveChildOnboarding = useRequestDraftStore((state) => state.saveChildOnboarding);
  const child = childId.length === 0
    ? children[0]
    : children.find((entry) => entry.id === childId);
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

  if (childId.length > 0 && (!isEntityId(childId, 'child') || child === undefined)) {
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

  const initialData = childToOnboardingData(
    child,
    child === undefined ? undefined : onboardingByChildId[child.id],
  );

  const handleComplete = (data: ChildOnboardingData): void => {
    const now = Date.now();
    const nextChild = buildChildDraftFromOnboarding(
      data,
      child?.id ?? `chd_${Crypto.randomUUID()}`,
      now,
      child?.createdAt ?? now,
    );

    saveChild(nextChild);
    saveChildOnboarding(nextChild.id, data);
    showToast({
      message: t(child === undefined ? 'children.added' : 'children.updated'),
      variant: 'success',
    });
    router.push(routes.contact);
  };

  return (
    <ChildOnboardingScreen
      onComplete={handleComplete}
      onExit={() => router.back()}
      initialData={initialData}
    />
  );
}
