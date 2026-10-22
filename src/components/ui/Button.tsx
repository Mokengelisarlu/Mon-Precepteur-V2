import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { themeColor, type PaletteColor } from '@/lib/theme';

import { Icon } from './Icon';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: LucideIcon;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
  testID?: string;
}

const containerVariants: Record<ButtonVariant, string> = {
  filled: 'bg-primary',
  tonal: 'bg-secondary-container',
  outlined: 'border border-outline',
  text: '',
};

const labelVariants: Record<ButtonVariant, string> = {
  filled: 'text-on-primary',
  tonal: 'text-on-secondary-container',
  outlined: 'text-primary',
  text: 'text-primary',
};

const spinnerColors: Record<ButtonVariant, PaletteColor> = {
  filled: 'on-primary',
  tonal: 'on-secondary-container',
  outlined: 'primary',
  text: 'primary',
};

const iconColors: Record<ButtonVariant, PaletteColor> = {
  filled: 'on-primary',
  tonal: 'on-secondary-container',
  outlined: 'primary',
  text: 'primary',
};

const sizeStyles: Record<ButtonSize, { container: string; label: string; icon: number }> = {
  sm: { container: 'min-h-[44px] px-l py-s', label: 'text-label-large', icon: 16 },
  md: { container: 'min-h-[48px] px-xl py-s', label: 'text-label-large', icon: 20 },
  lg: { container: 'min-h-[56px] px-xxl py-m', label: 'text-body-large', icon: 24 },
};

export function Button({
  label,
  onPress,
  variant = 'filled',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leadingIcon,
  accessibilityLabel,
  accessibilityHint,
  className,
  testID,
}: ButtonProps): React.JSX.Element {
  const isInactive = disabled || loading;
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      className={[
        'flex-row items-center justify-center gap-s rounded-button',
        containerVariants[variant],
        sizeStyle.container,
        fullWidth ? 'w-full' : '',
        isInactive ? 'opacity-40' : '',
        className ?? '',
      ].join(' ')}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={themeColor(spinnerColors[variant])} />
      ) : leadingIcon ? (
        <Icon icon={leadingIcon} size={sizeStyle.icon} color={iconColors[variant]} />
      ) : null}
      <Text className={[sizeStyle.label, labelVariants[variant]].join(' ')}>{label}</Text>
    </Pressable>
  );
}
