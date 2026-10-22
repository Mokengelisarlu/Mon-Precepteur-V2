import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Text, View } from 'react-native';

import { Icon } from '@/components/ui';

export interface WelcomeReassurancePoint {
  readonly icon: LucideIcon;
  readonly label: string;
}

export interface WelcomeReassuranceListProps {
  readonly label: string;
  readonly points: readonly WelcomeReassurancePoint[];
}

export function WelcomeReassuranceList({
  label,
  points,
}: WelcomeReassuranceListProps): React.JSX.Element {
  return (
    <View
      accessible
      accessibilityRole="list"
      accessibilityLabel={label}
      className="gap-m"
      testID="welcome-reassurance-list"
    >
      {points.map((point) => (
        <View key={point.label} className="flex-row items-center gap-m">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
            <Icon icon={point.icon} size={20} color="on-secondary-container" />
          </View>
          <Text className="flex-1 text-body-medium text-on-surface-variant">{point.label}</Text>
        </View>
      ))}
    </View>
  );
}
