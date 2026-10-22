import type React from 'react';
import { useMemo } from 'react';
import type { DimensionValue } from 'react-native';
import { Text, View } from 'react-native';

export interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  testID?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  className,
  testID,
}: ProgressBarProps): React.JSX.Element {
  const percentage = useMemo(() => Math.min(Math.max(value, 0), 1), [value]);
  const fillStyle = useMemo<{ width: DimensionValue }>(
    () => ({ width: `${percentage * 100}%` as DimensionValue }),
    [percentage],
  );

  return (
    <View className={className ?? ''} testID={testID}>
      {label !== undefined || showValue ? (
        <View className="mb-xs flex-row items-baseline justify-between gap-s">
          {label !== undefined ? (
            <Text className="text-label-medium text-on-surface-variant">{label}</Text>
          ) : null}
          {showValue ? (
            <Text className="text-label-medium text-on-surface-variant">
              {`${Math.round(percentage * 100)}%`}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(percentage * 100) }}
        className="h-[8px] w-full overflow-hidden rounded-full bg-surface-high"
      >
        <View className="h-full rounded-full bg-primary" style={fillStyle} />
      </View>
    </View>
  );
}
