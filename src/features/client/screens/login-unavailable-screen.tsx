import type React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

export interface LoginUnavailableScreenProps {
  readonly onBackHome: () => void;
}

export function LoginUnavailableScreen({
  onBackHome,
}: LoginUnavailableScreenProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <View
        className="flex-1 justify-between px-xl py-xl"
        testID="login-unavailable-screen"
      >
        <Text className="text-body-large text-on-surface-variant" testID="login-unavailable-message">
          {t('login.unavailable')}
        </Text>
        <Button
          label={t('common.backHome')}
          onPress={onBackHome}
          size="lg"
          fullWidth
          testID="login-back-home"
        />
      </View>
    </SafeAreaView>
  );
}
