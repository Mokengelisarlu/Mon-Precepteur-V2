import type React from 'react';
import { Text, View } from 'react-native';

import { Avatar, Card, KeyValue } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

export interface DashboardNeedSummary {
  readonly id: string;
  readonly subject: string;
  readonly level: string;
  readonly frequency: string;
  readonly tutorName?: string;
}

export interface DashboardNeedGroup {
  readonly id: string;
  readonly name: string;
  readonly needs: readonly DashboardNeedSummary[];
}

export interface NeedSummaryCardProps {
  readonly groups: readonly DashboardNeedGroup[];
}

export function NeedSummaryCard({ groups }: NeedSummaryCardProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Card testID="dashboard-needs">
      <View className="gap-m">
        <Text accessibilityRole="header" className="text-title-medium text-on-surface">
          {t('dashboard.needsTitle')}
        </Text>
        {groups.map((group) => (
          <View key={group.id} className="gap-s" testID={`dashboard-needs-${group.id}`}>
            <Text accessibilityRole="header" className="text-title-small text-on-surface">
              {group.name}
            </Text>
            {group.needs.map((need) => (
              <View key={need.id} className="gap-xs" testID={`dashboard-need-${need.id}`}>
                <View className="flex-row items-center justify-between gap-s">
                  <Text className="flex-1 text-body-large text-on-surface">{need.subject}</Text>
                  {need.tutorName === undefined ? null : (
                    <Avatar name={need.tutorName} size="sm" testID={`dashboard-tutor-${need.id}`} />
                  )}
                </View>
                <KeyValue label={t('need.level')} value={need.level} />
                <KeyValue label={t('need.frequency')} value={need.frequency} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </Card>
  );
}
