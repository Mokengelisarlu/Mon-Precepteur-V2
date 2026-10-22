import { ArrowRight, FileText, FlaskConical, GraduationCap, ShieldCheck } from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Alert, Badge, Button, SegmentedControl } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import { isLocale } from '@/lib/i18n';
import { themeColor } from '@/lib/theme';

import { WelcomeContinueSheet } from '../components/welcome-continue-sheet';
import { WelcomeHero } from '../components/welcome-hero';
import {
  WelcomeReassuranceList,
  type WelcomeReassurancePoint,
} from '../components/welcome-reassurance-list';

export type WelcomeRestorationState = 'idle' | 'restoring' | 'failed';

export interface WelcomeScreenProps {
  readonly onGetStarted: () => void;
  readonly onOpenAdmin: () => void;
  readonly onContinueRequest?: () => void;
  readonly hasDraft?: boolean;
  readonly restorationState?: WelcomeRestorationState;
}

export function WelcomeScreen({
  onGetStarted,
  onOpenAdmin,
  onContinueRequest,
  hasDraft = false,
  restorationState = 'idle',
}: WelcomeScreenProps): React.JSX.Element {
  const { t, locale, setLocale } = useTranslation();
  const [isRestorationBannerVisible, setIsRestorationBannerVisible] = useState(
    restorationState === 'failed',
  );
  const [isContinueSheetVisible, setIsContinueSheetVisible] = useState(false);

  if (restorationState === 'restoring') {
    return (
      <View className="flex-1 items-center justify-center bg-surface" testID="welcome-restoring">
        <ActivityIndicator
          size="large"
          color={themeColor('primary')}
          accessibilityLabel={t('common.loading')}
        />
      </View>
    );
  }

  const points: readonly WelcomeReassurancePoint[] = [
    { icon: GraduationCap, label: t('welcome.point.tutor') },
    { icon: FileText, label: t('welcome.point.contract') },
    { icon: ShieldCheck, label: t('welcome.point.payment') },
  ];

  const languageOptions = [
    { value: 'fr', label: t('welcome.language.fr') },
    { value: 'en', label: t('welcome.language.en') },
  ];

  const handleLanguageChange = (value: string): void => {
    if (isLocale(value)) {
      setLocale(value);
    }
  };

  const handleContinueRequest = (): void => {
    setIsContinueSheetVisible(false);
    onContinueRequest?.();
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerClassName="gap-xl px-xl pb-xxl"
        showsVerticalScrollIndicator={false}
        testID="welcome-scroll"
      >
        {isRestorationBannerVisible ? (
          <Alert
            variant="warning"
            message={t('welcome.restorationFailed')}
            dismissLabel={t('common.close')}
            onDismiss={() => setIsRestorationBannerVisible(false)}
            testID="welcome-restoration-banner"
          />
        ) : null}

        <WelcomeHero appName={t('common.appName')} tagline={t('welcome.tagline')} />

        <Text className="text-body-large text-on-surface-variant">{t('welcome.proposition')}</Text>

        <Button
          label={t('welcome.cta')}
          onPress={onGetStarted}
          size="lg"
          fullWidth
          leadingIcon={ArrowRight}
          testID="welcome-get-started"
        />

        <WelcomeReassuranceList label={t('welcome.reassuranceLabel')} points={points} />

        <View className="gap-s">
          <Text className="text-label-large text-on-surface-variant">{t('welcome.language')}</Text>
          <SegmentedControl
            options={languageOptions}
            value={locale}
            onChange={handleLanguageChange}
            accessibilityLabel={t('welcome.language')}
            testID="welcome-language-switch"
          />
        </View>

        {hasDraft ? (
          <Button
            label={t('welcome.continueRequest')}
            onPress={() => setIsContinueSheetVisible(true)}
            variant="outlined"
            fullWidth
            testID="welcome-continue-request"
          />
        ) : null}

        <View className="gap-s">
          <Alert
            variant="info"
            message={t('admin.simulation.banner')}
            testID="admin-simulation-banner"
          />
          <Pressable
            accessibilityRole="link"
            onPress={onOpenAdmin}
            className="min-h-[44px] flex-row items-center gap-s"
            testID="admin-simulation-link"
          >
            <Badge label={t('admin.simulation.badge')} variant="warning" icon={FlaskConical} />
            <Text className="flex-1 text-label-large text-primary">{t('admin.simulation.title')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <WelcomeContinueSheet
        visible={isContinueSheetVisible}
        title={t('welcome.continueSheet.title')}
        summary={t('welcome.continueSheet.summary')}
        continueLabel={t('common.continue')}
        cancelLabel={t('common.cancel')}
        onClose={() => setIsContinueSheetVisible(false)}
        onContinue={handleContinueRequest}
      />
    </View>
  );
}
