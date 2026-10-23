import { CheckCircle2 } from 'lucide-react-native';
import type React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Icon, KeyValue } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

export interface SubmittedScreenProps {
  readonly reference: string;
  readonly onDashboard: () => void;
}

export function SubmittedScreen({
  reference,
  onDashboard,
}: SubmittedScreenProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="submitted-screen">
      <View className="flex-1 justify-between gap-l px-l pb-l pt-xxl">
        <View className="gap-l">
          <View className="items-center gap-s" accessibilityRole="summary">
            <Icon
              icon={CheckCircle2}
              size={56}
              color="success"
              label={t('submitted.title')}
            />
            <Text
              accessibilityRole="header"
              className="text-center text-headline-small text-on-surface"
            >
              {t('submitted.title')}
            </Text>
          </View>
          <Card>
            <KeyValue
              label={t('submitted.reference')}
              value={reference}
              selectableValue
              testID="submitted-reference"
            />
          </Card>
          <Card>
            <View className="gap-s">
              <Text accessibilityRole="header" className="text-title-medium text-on-surface">
                {t('submitted.nextTitle')}
              </Text>
              <Text className="text-body-medium text-on-surface">
                {t('submitted.nextReview')}
              </Text>
              <Text className="text-body-medium text-on-surface">
                {t('submitted.nextProposal')}
              </Text>
              <Text className="text-body-medium text-on-surface">
                {t('submitted.nextConfirm')}
              </Text>
            </View>
          </Card>
          <Text className="text-center text-body-medium text-on-surface-variant">
            {t('submitted.paymentNotice')}
          </Text>
        </View>
        <Button
          label={t('submitted.dashboard')}
          onPress={onDashboard}
          fullWidth
          testID="submitted-dashboard"
        />
      </View>
    </SafeAreaView>
  );
}
