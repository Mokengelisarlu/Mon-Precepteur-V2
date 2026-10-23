import { Bell, Check, FileText } from 'lucide-react-native';
import type React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyState, Icon } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

import {
  NeedSummaryCard,
  type DashboardNeedGroup,
} from '../components/need-summary-card';
import { RequestStatusCard } from '../components/request-status-card';
import { RequestTimeline } from '../components/request-timeline';
import {
  NEXT_STEP_ACTION_LABEL_KEYS,
  deriveNextStep,
  type NextStepAction,
} from '../lib/derive-next-step';
import {
  REQUEST_STATUS_BADGE_VARIANTS,
  REQUEST_STATUS_LABEL_KEYS,
} from '../lib/request-status';
import type { RequestStatus } from '../types';

export interface DashboardRequestView {
  readonly id: string;
  readonly reference: string;
  readonly status: RequestStatus;
  readonly createdAt: number;
}

export interface DashboardRequestSummary {
  readonly id: string;
  readonly reference: string;
  readonly status: RequestStatus;
}

export interface DashboardScreenProps {
  readonly firstName?: string;
  readonly request: DashboardRequestView | null;
  readonly needGroups: readonly DashboardNeedGroup[];
  readonly requests: readonly DashboardRequestSummary[];
  readonly unreadNotificationCount: number;
  readonly onStartRequest: () => void;
  readonly onNotifications: () => void;
  readonly onSelectRequest: (requestId: string) => void;
  readonly onNextStepAction?: (action: NextStepAction) => void;
}

export function DashboardScreen({
  firstName,
  request,
  needGroups,
  requests,
  unreadNotificationCount,
  onStartRequest,
  onNotifications,
  onSelectRequest,
  onNextStepAction,
}: DashboardScreenProps): React.JSX.Element {
  const { t } = useTranslation();

  if (request === null) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="dashboard-screen">
        <View className="flex-1 justify-center">
          <EmptyState
            icon={FileText}
            title={t('dashboard.emptyTitle')}
            description={t('dashboard.emptyDescription')}
            action={
              <Button
                label={t('dashboard.startRequest')}
                onPress={onStartRequest}
                testID="dashboard-start-request"
              />
            }
            testID="dashboard-empty"
          />
        </View>
      </SafeAreaView>
    );
  }

  const nextStep = deriveNextStep({ status: request.status });
  const nextStepAction = nextStep.action;
  const nextAction =
    onNextStepAction !== undefined && nextStepAction !== null
      ? {
          action: nextStepAction,
          label: t(NEXT_STEP_ACTION_LABEL_KEYS[nextStepAction]),
          onPress: () => onNextStepAction(nextStepAction),
        }
      : undefined;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="dashboard-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-l px-l pb-xxl pt-l"
        showsVerticalScrollIndicator={false}
        testID="dashboard-scroll"
      >
        <View className="gap-xs">
          <Text
            accessibilityRole="header"
            className="text-headline-small text-on-surface"
            testID="dashboard-greeting"
          >
            {firstName === undefined
              ? t('dashboard.title')
              : t('dashboard.greeting', { firstName })}
          </Text>
          {firstName === undefined ? null : (
            <Text className="text-body-medium text-on-surface-variant">{t('dashboard.title')}</Text>
          )}
        </View>

        <Card
          onPress={onNotifications}
          accessibilityLabel={t('dashboard.notifications')}
          testID="dashboard-notifications"
        >
          <View className="flex-row items-center gap-m">
            <Icon icon={Bell} size={24} color="on-surface-variant" />
            <View className="flex-1">
              <Text className="text-body-large text-on-surface">
                {t('dashboard.notifications')}
              </Text>
              <Text className="text-body-small text-on-surface-variant">
                {unreadNotificationCount > 0
                  ? t('dashboard.unreadCount', { count: unreadNotificationCount })
                  : t('dashboard.notificationsNone')}
              </Text>
            </View>
            {unreadNotificationCount > 0 ? (
              <Badge
                label={String(unreadNotificationCount)}
                variant="primary"
                testID="dashboard-unread-badge"
              />
            ) : null}
          </View>
        </Card>

        <RequestStatusCard
          status={request.status}
          reference={request.reference}
          nextAction={nextAction}
        />

        <RequestTimeline status={request.status} createdAt={request.createdAt} />

        {needGroups.length > 0 ? <NeedSummaryCard groups={needGroups} /> : null}

        {requests.length > 1 ? (
          <Card title={t('dashboard.myRequests')} testID="dashboard-requests">
            <View className="mt-s gap-xs">
              {requests.map((summary) => {
                const isSelected = summary.id === request.id;

                return (
                  <Pressable
                    key={summary.id}
                    accessibilityRole="button"
                    accessibilityLabel={summary.reference}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => onSelectRequest(summary.id)}
                    className={[
                      'min-h-[44px] flex-row items-center justify-between gap-m rounded-card px-s py-xs',
                      isSelected ? 'bg-surface-high' : '',
                    ].join(' ')}
                    testID={`dashboard-request-${summary.id}`}
                  >
                    <View className="flex-row items-center gap-s">
                      {isSelected ? (
                        <Icon icon={Check} size={16} color="primary" />
                      ) : null}
                      <Text className="text-body-medium text-on-surface">{summary.reference}</Text>
                    </View>
                    <Badge
                      label={t(REQUEST_STATUS_LABEL_KEYS[summary.status])}
                      variant={REQUEST_STATUS_BADGE_VARIANTS[summary.status]}
                    />
                  </Pressable>
                );
              })}
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
