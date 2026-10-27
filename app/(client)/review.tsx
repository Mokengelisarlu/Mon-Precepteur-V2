import * as Crypto from 'expo-crypto';
import { Redirect, useRouter } from 'expo-router';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { useToast } from '@/components/feedback/ToastHost';
import { ReviewScreen } from '@/features/request/screens/review-screen';
import { submitRequest, type SubmitRequestFailureKey } from '@/features/request/services/submit-request';
import { useTranslation } from '@/hooks/use-translation';
import { routes } from '@/lib/navigation/routes';
import { useActivityStore } from '@/store/activity-store';
import { useChildStore } from '@/store/child-store';
import { useClientStore } from '@/store/client-store';
import { useDomainStore } from '@/store/domain-store';
import { useNotificationStore } from '@/store/notification-store';
import { useRequestDraftStore } from '@/store/request-draft-store';
import { useRequestStore } from '@/store/request-store';

export default function ReviewRoute(): React.JSX.Element {
  const router = useRouter();
  const journeyType = useRequestDraftStore((state) => state.journeyType);
  const contact = useRequestDraftStore((state) => state.contact);
  const clientId = useRequestDraftStore((state) => state.clientId);
  const children = useRequestDraftStore((state) => state.children);
  const onboardingByChildId = useRequestDraftStore((state) => state.onboardingByChildId);
  const selfNeeds = useRequestDraftStore((state) => state.selfNeeds);
  const tutorPreference = useRequestDraftStore((state) => state.tutorPreference);
  const clearDraft = useRequestDraftStore((state) => state.clearDraft);
  const clients = useClientStore((state) => state.clients);
  const saveChildren = useChildStore((state) => state.saveChildren);
  const saveNeeds = useDomainStore((state) => state.saveNeeds);
  const saveRequest = useRequestStore((state) => state.saveRequest);
  const requests = useRequestStore((state) => state.requests);
  const addActivityEvent = useActivityStore((state) => state.addActivityEvent);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<SubmitRequestFailureKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const isSubmittingRef = useRef(false);
  const client = clients.find((entry) => entry.id === clientId);

  useEffect(() => {
    if (hasSubmitted) {
      showToast({ message: t('submitted.successToast'), variant: 'success' });
      router.replace(routes.dashboard);
    }
  }, [hasSubmitted, router, showToast, t]);

  const handleSubmit = (): void => {
    if (isSubmittingRef.current || journeyType === null) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    const result = submitRequest({
      draft: {
        journeyType,
        contact,
        clientId,
        children,
        onboardingByChildId,
        selfNeeds,
        tutorPreference,
      },
      client,
      existingRequests: requests,
      ids: {
        requestId: `req_${Crypto.randomUUID()}`,
        eventId: `evt_${Crypto.randomUUID()}`,
        notificationId: `ntf_${Crypto.randomUUID()}`,
      },
      now: Date.now(),
    });

    if (!result.ok) {
      setErrorMessage(result.error.message);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    saveChildren(result.value.children);
    saveNeeds(result.value.needs);
    saveRequest(result.value.request);
    addActivityEvent(result.value.activityEvent);
    addNotification(result.value.notification);
    clearDraft();
    setHasSubmitted(true);
  };

  if (hasSubmitted) {
    return <></>;
  }

  if (journeyType === null) {
    return <Redirect href={routes.requestType} />;
  }
  if (contact === null || clientId === null) {
    return <Redirect href={routes.contact} />;
  }
  if (
    client === undefined ||
    client.pinHash.length === 0 ||
    client.pinSalt.length === 0
  ) {
    return <Redirect href={routes.pin} />;
  }

  return (
    <ReviewScreen
      journeyType={journeyType}
      childDrafts={children}
      onboardingByChildId={onboardingByChildId}
      selfNeeds={selfNeeds}
      contact={contact}
      tutorPreference={tutorPreference}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onEditChild={() => {
        const child = children[0];
        router.replace(child === undefined ? routes.children : routes.childrenFor(child.id));
      }}
      onEditSelfNeeds={() => router.replace(routes.needsSelf)}
      onEditLearner={() => router.replace(routes.contact)}
      onEditContact={() => router.replace(routes.contact)}
      onEditTutorPreference={() => {
        router.replace(routes.needsSelf);
      }}
      onSubmit={handleSubmit}
    />
  );
}
