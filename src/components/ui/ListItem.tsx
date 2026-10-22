import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from './Icon';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
  testID?: string;
}

export function ListItem({
  title,
  subtitle,
  leadingIcon,
  trailingIcon,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  className,
  testID,
}: ListItemProps): React.JSX.Element {
  const content = (
    <>
      {leadingIcon !== undefined ? (
        <Icon icon={leadingIcon} size={24} color="on-surface-variant" />
      ) : null}
      <View className="flex-1">
        <Text className="text-body-large text-on-surface">{title}</Text>
        {subtitle !== undefined ? (
          <Text className="text-body-small text-on-surface-variant">{subtitle}</Text>
        ) : null}
      </View>
      {trailingIcon !== undefined ? (
        <Icon icon={trailingIcon} size={24} color="on-surface-variant" />
      ) : null}
    </>
  );

  if (onPress === undefined) {
    return (
      <View
        className={['min-h-[56px] flex-row items-center gap-m py-s', className ?? ''].join(' ')}
        testID={testID}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={[
        'min-h-[56px] flex-row items-center gap-m py-s',
        disabled ? 'opacity-40' : '',
        className ?? '',
      ].join(' ')}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}
