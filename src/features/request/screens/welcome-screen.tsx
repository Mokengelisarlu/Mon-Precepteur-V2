import type React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

import { WelcomeHero } from '../components/welcome-hero';

export interface WelcomeScreenProps {
  readonly onGetStarted: () => void;
  readonly onLogin: () => void;
}

export function WelcomeScreen({
  onGetStarted,
  onLogin,
}: WelcomeScreenProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerClassName="flex-grow justify-between gap-xl px-xl py-xl"
        showsVerticalScrollIndicator={false}
        testID="welcome-scroll"
      >
        <View className="flex-1 items-center justify-center gap-xl">
          <WelcomeHero appName={t('common.appName')} />
          <Text className="max-w-[420px] text-center text-body-large text-on-surface-variant">
            {t('welcome.proposition')}
          </Text>
        </View>

        <View className="gap-s">
          <Button
            label={t('welcome.cta')}
            onPress={onGetStarted}
            size="lg"
            fullWidth
            testID="welcome-get-started"
          />
          <Button
            label={t('welcome.login')}
            onPress={onLogin}
            variant="outlined"
            size="lg"
            fullWidth
            testID="welcome-login"
          />
          <Text
            className="pt-s text-center text-body-small text-on-surface-variant"
            testID="welcome-powered-by"
          >
            {t('welcome.poweredBy')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
