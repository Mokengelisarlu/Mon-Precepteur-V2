import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

import { type PaletteColor } from '@/lib/theme';

import { Icon } from './Icon';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: () => void;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

const containerClasses: Record<ToastVariant, string> = {
  success: 'bg-success',
  error: 'bg-error',
  info: 'bg-info',
};

const textClasses: Record<ToastVariant, string> = {
  success: 'text-on-success',
  error: 'text-on-error',
  info: 'text-on-info',
};

const variantIcons: Record<ToastVariant, LucideIcon> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

const iconColors: Record<ToastVariant, PaletteColor> = {
  success: 'on-success',
  error: 'on-error',
  info: 'on-info',
};

export function Toast({
  visible,
  message,
  variant = 'info',
  duration = 3000,
  onDismiss,
  actionLabel,
  onAction,
  testID,
}: ToastProps): React.JSX.Element {
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    const timer = setTimeout(() => {
      dismissRef.current();
    }, duration);
    return () => {
      clearTimeout(timer);
    };
  }, [visible, duration]);

  if (!visible) {
    return <View testID={testID === undefined ? undefined : `${testID}-hidden`} />;
  }

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      className={[
        'flex-row items-center gap-m rounded-card px-l py-m shadow-elevation-3',
        containerClasses[variant],
      ].join(' ')}
      testID={testID}
    >
      <Icon icon={variantIcons[variant]} size={20} color={iconColors[variant]} />
      <Text className={['flex-1 text-body-medium', textClasses[variant]].join(' ')}>{message}</Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          className="min-h-[44px] justify-center px-s"
        >
          <Text className={['text-label-large', textClasses[variant]].join(' ')}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
