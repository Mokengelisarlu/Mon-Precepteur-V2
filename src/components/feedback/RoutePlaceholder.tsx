import type React from 'react';
import { Text, View } from 'react-native';

export interface RoutePlaceholderProps {
  route: string;
  testID?: string;
}

function toTestId(route: string): string {
  return `route-placeholder-${route.replace(/[^A-Za-z0-9]+/g, '-')}`;
}

export function RoutePlaceholder({ route, testID }: RoutePlaceholderProps): React.JSX.Element {
  return (
    <View
      className="flex-1 items-center justify-center bg-surface px-xl py-xxl"
      testID={testID ?? toTestId(route)}
    >
      <Text className="text-title-medium text-on-surface">{route}</Text>
    </View>
  );
}
