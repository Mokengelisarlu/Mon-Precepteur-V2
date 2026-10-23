import type React from 'react';
import { Text, View } from 'react-native';

import { Badge, Button, Card, KeyValue } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

import { deriveNextStep, type NextStepAction } from '../lib/derive-next-step';
import {
  REQUEST_STATUS_BADGE_VARIANTS,
  REQUEST_STATUS_LABEL_KEYS,
} from '../lib/request-status';
import type { RequestStatus } from '../types';

export interface RequestStatusCardProps {
  readonly status: RequestStatus;
  readonly reference: string;
  readonly nextAction?: {
    readonly action: NextStepAction;
    readonly label: string;
    readonly onPress: () => void;
  };
}

export function RequestStatusCard({
  status,
  reference,
  nextAction,
}: RequestStatusCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const nextStep = deriveNextStep({ status });

  return (
    <Card testID="dashboard-status-card">
      <View className="gap-s">
        <Badge
          label={t(REQUEST_STATUS_LABEL_KEYS[status])}
          variant={REQUEST_STATUS_BADGE_VARIANTS[status]}
          testID="dashboard-status-badge"
        />
        <Text className="text-body-small text-on-surface-variant">{t('dashboard.nextStep')}</Text>
        <Text
          accessibilityRole="header"
          className="text-title-large text-on-surface"
          testID="dashboard-next-step"
        >
          {t(nextStep.titleKey)}
        </Text>
        <Text className="text-body-medium text-on-surface-variant">
          {t(nextStep.descriptionKey)}
        </Text>
        <KeyValue
          label={t('dashboard.requestReference')}
          value={reference}
          selectableValue
          testID="dashboard-reference"
        />
        {nextAction === undefined ? null : (
          <Button
            label={nextAction.label}
            onPress={nextAction.onPress}
            fullWidth
            className="mt-s"
            testID="dashboard-next-action"
          />
        )}
      </View>
    </Card>
  );
}
