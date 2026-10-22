import type React from 'react';
import type { DimensionValue } from 'react-native';
import { StyleSheet, View } from 'react-native';

export type SkeletonVariant = 'text' | 'title' | 'block' | 'circle';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: DimensionValue;
  height?: number;
  className?: string;
  testID?: string;
}

const variantStyles = StyleSheet.create({
  text: { height: 14, borderRadius: 6 },
  title: { height: 24, borderRadius: 8 },
  block: { height: 96, borderRadius: 12 },
  circle: { height: 40, width: 40, borderRadius: 20 },
});

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  testID,
}: SkeletonProps): React.JSX.Element {
  const base = variantStyles[variant];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        base,
        width === undefined ? null : { width },
        height === undefined ? null : { height },
      ]}
      className={['bg-surface-high', className ?? ''].join(' ')}
      testID={testID}
    />
  );
}
