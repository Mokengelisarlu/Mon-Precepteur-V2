import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Text, View } from 'react-native';

import { type PaletteColor } from '@/lib/theme';

import { Icon } from './Icon';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: LucideIcon;
  className?: string;
  testID?: string;
}

const containerClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-high text-on-surface-variant',
  primary: 'bg-primary-container text-on-primary-container',
  success: 'bg-success-container text-on-success-container',
  warning: 'bg-warning-container text-on-warning-container',
  error: 'bg-error-container text-on-error-container',
  info: 'bg-info-container text-on-info-container',
};

const iconColors: Record<BadgeVariant, PaletteColor> = {
  neutral: 'on-surface-variant',
  primary: 'on-primary-container',
  success: 'on-success-container',
  warning: 'on-warning-container',
  error: 'on-error-container',
  info: 'on-info-container',
};

export function Badge({
  label,
  variant = 'neutral',
  icon,
  className,
  testID,
}: BadgeProps): React.JSX.Element {
  return (
    <View
      className={[
        'flex-row items-center gap-xs self-start rounded-full px-s py-xs',
        containerClasses[variant],
        className ?? '',
      ].join(' ')}
      testID={testID}
    >
      {icon !== undefined ? <Icon icon={icon} size={14} color={iconColors[variant]} /> : null}
      <Text className="text-label-medium">{label}</Text>
    </View>
  );
}
