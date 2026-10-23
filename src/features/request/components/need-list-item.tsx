import { Pencil, Trash2 } from 'lucide-react-native';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon, IconButton } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/i18n/types';

import type { LearningNeedDraft, NeedFrequency } from '../types';

const FREQUENCY_LABEL_KEYS = {
  weekly_1: 'need.frequency.weekly_1',
  weekly_2: 'need.frequency.weekly_2',
  weekly_3: 'need.frequency.weekly_3',
  monthly_1: 'need.frequency.monthly_1',
  flexible: 'need.frequency.flexible',
} as const satisfies Record<NeedFrequency, TranslationKey>;

export interface NeedListItemProps {
  readonly need: LearningNeedDraft;
  readonly onEdit: () => void;
  readonly onRemove: () => void;
}

export function NeedListItem({
  need,
  onEdit,
  onRemove,
}: NeedListItemProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-s rounded-card bg-surface-container p-s">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${need.subject}, ${t(FREQUENCY_LABEL_KEYS[need.frequency])}`}
        onPress={onEdit}
        className="min-h-[56px] flex-1 flex-row items-center gap-s"
        testID={`need-edit-${need.id}`}
      >
        <View className="flex-1 gap-xs">
          <Text className="text-title-medium text-on-surface">{need.subject}</Text>
          <Text className="text-body-small text-on-surface-variant">
            {t('need.levelSummary', { level: need.level })} · {t(FREQUENCY_LABEL_KEYS[need.frequency])} ·{' '}
            {t('need.sessionMinutesSummary', { minutes: need.sessionMinutes })}
          </Text>
          <Text className="text-body-small text-on-surface-variant">{need.objective}</Text>
        </View>
        <Icon icon={Pencil} size={18} color="on-surface-variant" />
      </Pressable>
      <IconButton
        icon={Trash2}
        accessibilityLabel={t('need.removeTitle')}
        accessibilityHint={t('need.remove')}
        onPress={onRemove}
        size="sm"
        testID={`need-remove-${need.id}`}
      />
    </View>
  );
}
