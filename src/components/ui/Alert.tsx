import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';

import { type PaletteColor } from '@/lib/theme';

import { Icon } from './Icon';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  dismissLabel?: string;
  action?: React.ReactNode;
  className?: string;
  testID?: string;
}

const containerClasses: Record<AlertVariant, string> = {
  info: 'bg-info-container',
  warning: 'bg-warning-container',
  error: 'bg-error-container',
  success: 'bg-success-container',
};

const textClasses: Record<AlertVariant, string> = {
  info: 'text-on-info-container',
  warning: 'text-on-warning-container',
  error: 'text-on-error-container',
  success: 'text-on-success-container',
};

const variantIcons: Record<AlertVariant, LucideIcon> = {
  info: Info,
  warning: TriangleAlert,
  error: CircleAlert,
  success: CircleCheck,
};

const iconColors: Record<AlertVariant, PaletteColor> = {
  info: 'on-info-container',
  warning: 'on-warning-container',
  error: 'on-error-container',
  success: 'on-success-container',
};

export function Alert({
  variant = 'info',
  title,
  message,
  onDismiss,
  dismissLabel,
  action,
  className,
  testID,
}: AlertProps): React.JSX.Element {
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'text';

  return (
    <View
      accessible
      accessibilityRole={role}
      accessibilityLabel={title ?? message}
      className={['flex-row items-start gap-m rounded-card p-l', containerClasses[variant], className ?? ''].join(' ')}
      testID={testID}
    >
      <Icon icon={variantIcons[variant]} size={20} color={iconColors[variant]} />
      <View className="flex-1">
        {title !== undefined ? (
          <Text className={['text-title-small', textClasses[variant]].join(' ')}>{title}</Text>
        ) : null}
        <Text className={['text-body-medium', textClasses[variant]].join(' ')}>{message}</Text>
        {action}
      </View>
      {onDismiss !== undefined && dismissLabel !== undefined ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dismissLabel}
          onPress={onDismiss}
          className="min-h-[44px] min-w-[44px] items-center justify-center"
        >
          <Text className={['text-label-large', textClasses[variant]].join(' ')}>{dismissLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
