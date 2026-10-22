import { Stack } from 'expo-router';
import type React from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { themeColor } from '@/lib/theme';

export default function AdminLayout(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: themeColor('surface-highest') },
        headerTintColor: themeColor('on-surface'),
        headerTitleStyle: { color: themeColor('on-surface') },
        headerBackButtonDisplayMode: 'minimal',
        title: t('admin.simulation.title'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('nav.adminDashboard') }} />
      <Stack.Screen name="request/[requestId]" options={{ title: t('nav.adminRequest') }} />
      <Stack.Screen name="proposal/new" options={{ title: t('nav.adminProposal') }} />
      <Stack.Screen name="contract/new" options={{ title: t('nav.adminContract') }} />
      <Stack.Screen name="invoice/new" options={{ title: t('nav.adminInvoice') }} />
      <Stack.Screen name="payment/[paymentId]" options={{ title: t('nav.adminPaymentVerification') }} />
      <Stack.Screen name="receipt/issue" options={{ title: t('nav.adminReceipt') }} />
      <Stack.Screen name="assignment" options={{ title: t('nav.adminAssignment') }} />
      <Stack.Screen name="history" options={{ title: t('nav.adminHistory') }} />
    </Stack>
  );
}
