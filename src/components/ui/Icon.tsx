import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { View } from 'react-native';

import { themeColor, type PaletteColor } from '@/lib/theme';

export interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: PaletteColor;
  strokeWidth?: number;
  label?: string;
  className?: string;
  testID?: string;
}

export function Icon({
  icon: Glyph,
  size = 20,
  color = 'on-surface',
  strokeWidth = 2,
  label,
  className,
  testID,
}: IconProps): React.JSX.Element {
  const glyph = (
    <Glyph
      size={size}
      color={themeColor(color)}
      strokeWidth={strokeWidth}
      testID={testID}
    />
  );

  if (label !== undefined) {
    return (
      <View accessible accessibilityRole="image" accessibilityLabel={label} className={className}>
        {glyph}
      </View>
    );
  }

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={className}
    >
      {glyph}
    </View>
  );
}
