import { Stack } from 'expo-router';
import type React from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { themeColor } from '@/lib/theme';

export default function ClientLayout(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: themeColor('surface') },
        headerTintColor: themeColor('on-surface'),
        headerTitleStyle: { color: themeColor('on-surface') },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="request-type" options={{ title: t('nav.requestType') }} />
      <Stack.Screen name="children" options={{ title: t('nav.children') }} />
      <Stack.Screen name="children/form" options={{ title: t('nav.childForm') }} />
      <Stack.Screen name="needs/child/[childId]" options={{ title: t('nav.childNeeds') }} />
      <Stack.Screen name="needs/self" options={{ title: t('nav.selfNeeds') }} />
      <Stack.Screen name="contact" options={{ title: t('nav.contact') }} />
      <Stack.Screen name="pin" options={{ title: t('nav.pin') }} />
      <Stack.Screen name="review" options={{ title: t('nav.review') }} />
      <Stack.Screen name="submitted" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: t('nav.dashboard') }} />
      <Stack.Screen name="proposal/[proposalId]" options={{ title: t('nav.proposal') }} />
      <Stack.Screen name="contract/[contractId]" options={{ title: t('nav.contract') }} />
      <Stack.Screen name="invoice/[invoiceId]" options={{ title: t('nav.invoice') }} />
      <Stack.Screen name="payment/[invoiceId]" options={{ title: t('nav.payment') }} />
      <Stack.Screen name="receipt/[receiptId]" options={{ title: t('nav.receipt') }} />
      <Stack.Screen name="tutor/[needId]" options={{ title: t('nav.tutor') }} />
      <Stack.Screen name="notifications" options={{ title: t('nav.notifications') }} />
    </Stack>
  );
}
