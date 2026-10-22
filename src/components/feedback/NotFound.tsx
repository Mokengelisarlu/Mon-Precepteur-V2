import { Home } from 'lucide-react-native';
import type React from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui';

export interface NotFoundProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  testID?: string;
}

export function NotFound({
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: NotFoundProps): React.JSX.Element {
  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={title}
      className="flex-1 items-center justify-center bg-surface px-xl py-xxl"
      testID={testID}
    >
      <View className="w-full max-w-[420px] items-center gap-l">
        <Text accessibilityRole="header" className="text-headline-medium text-on-surface">
          {title}
        </Text>
        <Text className="text-center text-body-large text-on-surface-variant">{description}</Text>
        <Button label={actionLabel} onPress={onAction} leadingIcon={Home} variant="tonal" />
      </View>
    </View>
  );
}
