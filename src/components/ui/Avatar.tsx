import type React from 'react';
import { Text, View } from 'react-native';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
  testID?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-[32px] w-[32px]',
  md: 'h-[40px] w-[40px]',
  lg: 'h-[56px] w-[56px]',
};

const textClasses: Record<AvatarSize, string> = {
  sm: 'text-label-medium',
  md: 'text-title-medium',
  lg: 'text-headline-small',
};

export function Avatar({
  name,
  size = 'md',
  className,
  testID,
}: AvatarProps): React.JSX.Element {
  const initials = name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      className={[
        'items-center justify-center rounded-full bg-primary-container',
        sizeClasses[size],
        className ?? '',
      ].join(' ')}
      testID={testID}
    >
      <Text className={['text-on-primary-container', textClasses[size]].join(' ')}>{initials}</Text>
    </View>
  );
}
