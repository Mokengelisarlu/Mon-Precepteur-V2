import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Pressable } from 'react-native';

import { type PaletteColor } from '@/lib/theme';

import { Icon } from './Icon';

export type IconButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  className?: string;
  testID?: string;
}

const containerVariants: Record<IconButtonVariant, string> = {
  filled: 'bg-primary',
  tonal: 'bg-secondary-container',
  outlined: 'border border-outline',
  text: '',
};

const iconColors: Record<IconButtonVariant, PaletteColor> = {
  filled: 'on-primary',
  tonal: 'on-secondary-container',
  outlined: 'primary',
  text: 'primary',
};

const sizeStyles: Record<IconButtonSize, { container: string; icon: number }> = {
  sm: { container: 'h-[44px] w-[44px]', icon: 18 },
  md: { container: 'h-[48px] w-[48px]', icon: 22 },
  lg: { container: 'h-[56px] w-[56px]', icon: 26 },
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  variant = 'text',
  size = 'md',
  disabled = false,
  className,
  testID,
}: IconButtonProps): React.JSX.Element {
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={[
        'items-center justify-center rounded-button',
        containerVariants[variant],
        sizeStyle.container,
        disabled ? 'opacity-40' : '',
        className ?? '',
      ].join(' ')}
      testID={testID}
    >
      <Icon icon={icon} size={sizeStyle.icon} color={iconColors[variant]} />
    </Pressable>
  );
}
