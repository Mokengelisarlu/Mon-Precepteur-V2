import { useRouter } from 'expo-router';
import type React from 'react';
import { useState } from 'react';

import type { DashboardNeedGroup, DashboardNeedSummary } from '@/features/request/components/need-summary-card';
import { NEED_FREQUENCY_LABEL_KEYS } from '@/features/request/lib/need-labels';
import {
  DashboardScreen,
  type DashboardRequestSummary,
  type DashboardRequestView,
} from '@/features/request/screens/dashboard-screen';
import type { LearningNeed } from '@/features/request/types';
import { useTranslation } from '@/hooks/use-translation';
import { routes } from '@/lib/navigation/routes';
import { useChildStore } from '@/store/child-store';
import { useClientStore } from '@/store/client-store';
import { useDomainStore } from '@/store/domain-store';
import { useNotificationStore } from '@/store/notification-store';
import { useRequestStore } from '@/store/request-store';

function displayName(firstName: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

export default function DashboardRoute(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const requests = useRequestStore((state) => state.requests);
  const needs = useDomainStore((state) => state.needs);
  const children = useChildStore((state) => state.children);
  const clients = useClientStore((state) => state.clients);
  const notifications = useNotificationStore((state) => state.notifications);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const sortedRequests = [...requests].sort((left, right) => right.createdAt - left.createdAt);
  const latestRequest = sortedRequests[0] ?? null;
  const selectedRequest =
    sortedRequests.find((request) => request.id === selectedRequestId) ?? latestRequest;
  const client =
    selectedRequest === null
      ? undefined
      : clients.find((entry) => entry.id === selectedRequest.clientId);

  const clientRequests: readonly DashboardRequestSummary[] =
    selectedRequest === null
      ? []
      : sortedRequests
          .filter((request) => request.clientId === selectedRequest.clientId)
          .map((request) => ({
            id: request.id,
            reference: request.reference,
            status: request.status,
          }));

  const unreadNotificationCount =
    selectedRequest === null
      ? 0
      : notifications.filter(
          (notification) =>
            notification.clientId === selectedRequest.clientId &&
            notification.readAt === undefined,
        ).length;

  let needGroups: readonly DashboardNeedGroup[] = [];
  if (selectedRequest !== null) {
    const requestNeeds = selectedRequest.needIds
      .map((needId) => needs.find((need) => need.id === needId))
      .filter((need): need is LearningNeed => need !== undefined);
    const toSummary = (need: LearningNeed): DashboardNeedSummary => ({
      id: need.id,
      subject: need.subject,
      level: need.level,
      frequency: t(NEED_FREQUENCY_LABEL_KEYS[need.frequency]),
    });

    if (selectedRequest.type === 'self') {
      const learnerName =
        client === undefined
          ? t('dashboard.you')
          : displayName(client.firstName, client.lastName);
      needGroups =
        requestNeeds.length === 0
          ? []
          : [{ id: 'self', name: learnerName, needs: requestNeeds.map(toSummary) }];
    } else {
      needGroups = selectedRequest.childIds.flatMap((childId) => {
        const child = children.find((entry) => entry.id === childId);
        if (child === undefined) {
          return [];
        }

        const childNeeds = requestNeeds.filter((need) => need.childId === childId);
        if (childNeeds.length === 0) {
          return [];
        }

        return [
          {
            id: childId,
            name: displayName(child.firstName, child.lastName),
            needs: childNeeds.map(toSummary),
          },
        ];
      });
    }
  }

  const requestView: DashboardRequestView | null =
    selectedRequest === null
      ? null
      : {
          id: selectedRequest.id,
          reference: selectedRequest.reference,
          status: selectedRequest.status,
          createdAt: selectedRequest.createdAt,
        };

  return (
    <DashboardScreen
      firstName={client?.firstName}
      request={requestView}
      needGroups={needGroups}
      requests={clientRequests}
      unreadNotificationCount={unreadNotificationCount}
      onStartRequest={() => router.push(routes.requestType)}
      onNotifications={() => router.push(routes.notifications)}
      onSelectRequest={setSelectedRequestId}
    />
  );
}
