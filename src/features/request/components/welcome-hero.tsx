import type React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import logoSource from '../../../../assets/mon-precepteur-logo.png';

export interface WelcomeHeroProps {
  readonly appName: string;
  readonly tagline: string;
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 106,
  },
});

export function WelcomeHero({ appName, tagline }: WelcomeHeroProps): React.JSX.Element {
  return (
    <View className="items-center gap-xs" testID="welcome-hero">
      <Image
        source={logoSource}
        style={styles.logo}
        resizeMode="contain"
        accessible={false}
        testID="welcome-logo"
      />
      <Text className="text-title-medium text-on-surface-variant">{appName}</Text>
      <Text
        accessibilityRole="header"
        className="text-center text-headline-small text-on-surface"
        testID="welcome-tagline"
      >
        {tagline}
      </Text>
    </View>
  );
}
