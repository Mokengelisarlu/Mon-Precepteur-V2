import type React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  elevated?: boolean;
  className?: string;
  testID?: string;
}

export function Card({
  children,
  title,
  subtitle,
  onPress,
  elevated = false,
  className,
  testID,
}: CardProps): React.JSX.Element {
  const content = (
    <>
      {title !== undefined ? (
        <Text className="text-title-medium text-on-surface">{title}</Text>
      ) : null}
      {subtitle !== undefined ? (
        <Text className="text-body-small text-on-surface-variant">{subtitle}</Text>
      ) : null}
      {children}
    </>
  );

  const baseClass = [
    'rounded-card border border-outline-variant bg-surface-container p-l',
    elevated ? 'shadow-elevation-2' : '',
    className ?? '',
  ].join(' ');

  if (onPress !== undefined) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        className={baseClass}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className={baseClass} testID={testID}>
      {content}
    </View>
  );
}
