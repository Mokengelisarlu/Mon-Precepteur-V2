import { Pencil, Trash2 } from 'lucide-react-native';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar, Icon, IconButton } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

import type { ChildDraftRecord } from '../types';
import { ageFromBirthYear } from '../validation';

export interface ChildListItemProps {
  readonly child: ChildDraftRecord;
  readonly onEdit: () => void;
  readonly onRemove: () => void;
}

export function ChildListItem({
  child,
  onEdit,
  onRemove,
}: ChildListItemProps): React.JSX.Element {
  const { t } = useTranslation();
  const name = [child.firstName, child.lastName].filter(Boolean).join(' ');
  const age = ageFromBirthYear(child.yearOfBirth);
  const details = [
    t('children.levelSummary', { level: child.level }),
    t('children.ageSummary', { age }),
    child.school === undefined ? undefined : t('children.schoolSummary', { school: child.school }),
  ].filter(Boolean);

  return (
    <View className="flex-row items-center gap-s rounded-card bg-surface-container p-s">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[name, ...details].join(', ')}
        onPress={onEdit}
        className="min-h-[56px] flex-1 flex-row items-center gap-s"
        testID={`child-edit-${child.id}`}
      >
        <Avatar name={name} />
        <View className="flex-1">
          <Text className="text-title-medium text-on-surface">{name}</Text>
          <Text className="text-body-small text-on-surface-variant">
            {details.join(' · ')}
          </Text>
        </View>
        <Icon icon={Pencil} size={18} color="on-surface-variant" />
      </Pressable>
      <IconButton
        icon={Trash2}
        accessibilityLabel={t('children.removeTitle')}
        accessibilityHint={t('children.remove')}
        onPress={onRemove}
        size="sm"
        testID={`child-remove-${child.id}`}
      />
    </View>
  );
}
