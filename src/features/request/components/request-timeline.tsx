import type React from 'react';
import { Text, View } from 'react-native';

import { Card, Timeline, type TimelineEntry } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import { formatDate } from '@/lib/format';

import { deriveNextStep } from '../lib/derive-next-step';
import {
  REQUEST_STATUS_LABEL_KEYS,
  REQUEST_TIMELINE_LABEL_KEYS,
  REQUEST_TIMELINE_PHASES,
  timelinePhaseIndex,
} from '../lib/request-status';
import type { RequestStatus } from '../types';

export interface RequestTimelineProps {
  readonly status: RequestStatus;
  readonly createdAt: number;
}

export function RequestTimeline({
  status,
  createdAt,
}: RequestTimelineProps): React.JSX.Element {
  const { t, locale } = useTranslation();
  const dateLabel = formatDate(createdAt, locale);

  let entries: readonly TimelineEntry[];
  if (status === 'on_hold' || status === 'cancelled') {
    entries = [
      {
        id: status,
        title: t(REQUEST_STATUS_LABEL_KEYS[status]),
        description: t(deriveNextStep({ status }).descriptionKey),
        dateLabel,
        status: 'current',
      },
    ];
  } else {
    const currentIndex = timelinePhaseIndex(status);
    entries = REQUEST_TIMELINE_PHASES.map((phase, index) => ({
      id: phase,
      title: t(REQUEST_TIMELINE_LABEL_KEYS[phase]),
      dateLabel: index === 0 ? dateLabel : undefined,
      status:
        status === 'completed'
          ? 'done'
          : index < currentIndex
            ? 'done'
            : index === currentIndex
              ? 'current'
              : 'upcoming',
    }));
  }

  return (
    <Card testID="dashboard-timeline">
      <View className="gap-s">
        <Text accessibilityRole="header" className="text-title-medium text-on-surface">
          {t('dashboard.timelineTitle')}
        </Text>
        <Timeline entries={entries} testID="dashboard-timeline-entries" />
      </View>
    </Card>
  );
}
