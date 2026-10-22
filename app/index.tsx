import type React from 'react';
import { Text, View } from 'react-native';

export default function Index(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="text-body-large text-on-surface">Mon Précepteur</Text>
    </View>
  );
}
