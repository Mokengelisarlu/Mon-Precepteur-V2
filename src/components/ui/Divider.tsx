import type React from 'react';
import { View } from 'react-native';

export interface DividerProps {
  className?: string;
  testID?: string;
}

export function Divider({ className, testID }: DividerProps): React.JSX.Element {
  return <View className={['h-px w-full bg-outline-variant', className ?? ''].join(' ')} testID={testID} />;
}
