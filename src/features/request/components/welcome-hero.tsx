import type React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import logoSource from '../../../../assets/mon-precepteur-logo.png';

export interface WelcomeHeroProps {
  readonly appName: string;
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 106,
  },
});

export function WelcomeHero({ appName }: WelcomeHeroProps): React.JSX.Element {
  return (
    <View className="items-center gap-xs" testID="welcome-hero">
      <Image
        source={logoSource}
        style={styles.logo}
        resizeMode="contain"
        accessible={false}
        testID="welcome-logo"
      />
      <Text
        accessibilityRole="header"
        className="text-center text-title-medium text-on-surface-variant"
        testID="welcome-app-name"
      >
        {appName}
      </Text>
    </View>
  );
}
