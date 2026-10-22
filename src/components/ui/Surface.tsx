import type React from 'react';
import { View } from 'react-native';

export type SurfaceVariant = 'surface' | 'low' | 'container' | 'high' | 'highest';

export type SurfaceElevation = 'none' | 'elevation-1' | 'elevation-2' | 'elevation-3';

export interface SurfaceProps {
  variant?: SurfaceVariant;
  elevation?: SurfaceElevation;
  children?: React.ReactNode;
  className?: string;
  testID?: string;
}

const variantClasses: Record<SurfaceVariant, string> = {
  surface: 'bg-surface',
  low: 'bg-surface-low',
  container: 'bg-surface-container',
  high: 'bg-surface-high',
  highest: 'bg-surface-highest',
};

const elevationClasses: Record<SurfaceElevation, string> = {
  none: '',
  'elevation-1': 'shadow-elevation-1',
  'elevation-2': 'shadow-elevation-2',
  'elevation-3': 'shadow-elevation-3',
};

export function Surface({
  variant = 'surface',
  elevation = 'none',
  children,
  className,
  testID,
}: SurfaceProps): React.JSX.Element {
  return (
    <View
      className={[variantClasses[variant], elevationClasses[elevation], className ?? ''].join(' ')}
      testID={testID}
    >
      {children}
    </View>
  );
}
