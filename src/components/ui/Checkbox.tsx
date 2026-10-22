import { Check } from 'lucide-react-native';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from './Icon';

export interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  accessibilityLabel?: string;
  className?: string;
  testID?: string;
}

const boxSizes: Record<'sm' | 'md', string> = {
  sm: 'h-[20px] w-[20px] rounded-[6px]',
  md: 'h-[24px] w-[24px] rounded-[8px]',
};

export function Checkbox({
  checked,
  onToggle,
  label,
  disabled = false,
  size = 'md',
  accessibilityLabel,
  className,
  testID,
}: CheckboxProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onToggle}
      className={[
        'min-h-[44px] flex-row items-center gap-s',
        disabled ? 'opacity-40' : '',
        className ?? '',
      ].join(' ')}
      testID={testID}
    >
      <View
        className={[
          'items-center justify-center border',
          boxSizes[size],
          checked ? 'border-primary bg-primary' : 'border-outline bg-surface',
        ].join(' ')}
      >
        {checked ? <Icon icon={Check} size={size === 'sm' ? 14 : 16} color="on-primary" /> : null}
      </View>
      {label !== undefined ? (
        <Text className="flex-1 text-body-medium text-on-surface">{label}</Text>
      ) : null}
    </Pressable>
  );
}
