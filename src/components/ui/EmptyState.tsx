import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Text, View } from 'react-native';

import { Icon } from './Icon';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  testID?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  testID,
}: EmptyStateProps): React.JSX.Element {
  return (
    <View
      className={['items-center justify-center px-xl py-xxl', className ?? ''].join(' ')}
      testID={testID}
    >
      <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-surface-high">
        <Icon icon={icon} size={32} color="on-surface-variant" />
      </View>
      <Text className="mt-l text-title-medium text-on-surface">{title}</Text>
      {description !== undefined ? (
        <Text className="mt-xs text-center text-body-medium text-on-surface-variant">{description}</Text>
      ) : null}
      {action !== undefined ? <View className="mt-l">{action}</View> : null}
    </View>
  );
}
