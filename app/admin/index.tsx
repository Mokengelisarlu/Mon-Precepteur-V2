import type React from 'react';
import { View } from 'react-native';

import { RoutePlaceholder } from '@/components/feedback';
import { Alert } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

export default function AdminHomeRoute(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-surface">
      <RoutePlaceholder route="/admin" />
      <View className="px-xl pb-xxl">
        <Alert variant="info" message={t('admin.simulation.banner')} testID="admin-simulation-banner" />
      </View>
    </View>
  );
}
