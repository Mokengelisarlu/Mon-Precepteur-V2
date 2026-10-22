import type React from 'react';
import { Text, View } from 'react-native';

export interface KeyValueProps {
  label: string;
  value: string;
  className?: string;
  testID?: string;
}

export function KeyValue({ label, value, className, testID }: KeyValueProps): React.JSX.Element {
  return (
    <View
      className={['min-h-[32px] flex-row items-start justify-between gap-m py-xs', className ?? ''].join(' ')}
      testID={testID}
    >
      <Text className="flex-1 text-body-medium text-on-surface-variant">{label}</Text>
      <Text className="flex-1 text-body-medium text-on-surface">{value}</Text>
    </View>
  );
}
