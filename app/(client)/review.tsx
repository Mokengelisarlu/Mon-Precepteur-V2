import * as Crypto from 'expo-crypto';
import { Redirect, useRouter } from 'expo-router';
import type React from 'react';
import { useRef, useState } from 'react';

import { ReviewScreen } from '@/features/request/screens/review-screen';
import { submitRequest, type SubmitRequestFailureKey } from '@/features/request/services/submit-request';
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
  const needsByChildId = useRequestDraftStore((state) => state.needsByChildId);
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
  const [errorMessage, setErrorMessage] = useState<SubmitRequestFailureKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);
  const client = clients.find((entry) => entry.id === clientId);

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
        needsByChildId,
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
    setSubmittedRequestId(result.value.request.id);
    clearDraft();
  };

  if (submittedRequestId !== null) {
    return (
      <Redirect
        href={{
          pathname: routes.submitted,
          params: { requestId: submittedRequestId },
        }}
      />
    );
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
      needsByChildId={needsByChildId}
      selfNeeds={selfNeeds}
      contact={contact}
      tutorPreference={tutorPreference}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onEditChildren={() => router.replace(routes.children)}
      onEditNeedsForChild={(childId) => router.replace(routes.needsForChild(childId))}
      onEditSelfNeeds={() => router.replace(routes.needsSelf)}
      onEditLearner={() => router.replace(routes.contact)}
      onEditContact={() => router.replace(routes.contact)}
      onEditTutorPreference={() => {
        if (journeyType === 'self') {
          router.replace(routes.needsSelf);
          return;
        }
        const firstChild = children[0];
        router.replace(
          firstChild === undefined ? routes.children : routes.needsForChild(firstChild.id),
        );
      }}
      onSubmit={handleSubmit}
    />
  );
}
