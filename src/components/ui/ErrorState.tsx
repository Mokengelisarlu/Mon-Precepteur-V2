import { CircleAlert } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Text, View } from 'react-native';

import { Button } from './Button';
import { Icon } from './Icon';

export interface ErrorStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
  testID?: string;
}

export function ErrorState({
  title,
  description,
  icon,
  retryLabel,
  onRetry,
  className,
  testID,
}: ErrorStateProps): React.JSX.Element {
  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={title}
      className={['items-center justify-center px-xl py-xxl', className ?? ''].join(' ')}
      testID={testID}
    >
      <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-error-container">
        <Icon icon={icon ?? CircleAlert} size={32} color="on-error-container" />
      </View>
      <Text className="mt-l text-title-medium text-on-surface">{title}</Text>
      {description !== undefined ? (
        <Text className="mt-xs text-center text-body-medium text-on-surface-variant">{description}</Text>
      ) : null}
      {retryLabel !== undefined && onRetry !== undefined ? (
        <View className="mt-l">
          <Button label={retryLabel} variant="tonal" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
