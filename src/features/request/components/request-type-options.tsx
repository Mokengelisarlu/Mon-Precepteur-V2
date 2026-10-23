import { Baby, ChevronRight, UserRound } from 'lucide-react-native';
import type React from 'react';
import { View } from 'react-native';

import { ListItem } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

import type { JourneyType } from '../types';

export interface RequestTypeOptionsProps {
  readonly onSelect: (journeyType: JourneyType) => void;
}

export function RequestTypeOptions({
  onSelect,
}: RequestTypeOptionsProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View className="gap-s" testID="request-type-options">
      <ListItem
        title={t('requestType.child')}
        subtitle={t('requestType.childDescription')}
        leadingIcon={Baby}
        trailingIcon={ChevronRight}
        accessibilityHint={t('requestType.childDescription')}
        className="rounded-card bg-surface-low px-l"
        onPress={() => onSelect('child')}
        testID="request-type-child"
      />
      <ListItem
        title={t('requestType.self')}
        subtitle={t('requestType.selfDescription')}
        leadingIcon={UserRound}
        trailingIcon={ChevronRight}
        accessibilityHint={t('requestType.selfDescription')}
        className="rounded-card bg-surface-low px-l"
        onPress={() => onSelect('self')}
        testID="request-type-self"
      />
    </View>
  );
}
