import type React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: readonly SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  triggerRef?: React.Ref<React.ElementRef<typeof Pressable>>;
  accessibilityLabel?: string;
  className?: string;
  testID?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  onBlur,
  triggerRef,
  accessibilityLabel,
  className,
  testID,
}: SegmentedControlProps): React.JSX.Element {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={['flex-row rounded-button bg-surface-high p-xs', className ?? ''].join(' ')}
      testID={testID}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            ref={
              isSelected || (value === '' && index === 0)
                ? triggerRef
                : undefined
            }
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            onBlur={onBlur}
            className={[
              'min-h-[44px] flex-1 items-center justify-center rounded-button px-s',
              isSelected ? 'bg-surface shadow-elevation-1' : 'shadow-none',
            ].join(' ')}
          >
            <Text
              className={[
                'text-label-large',
                isSelected ? 'text-on-surface' : 'text-on-surface-variant',
              ].join(' ')}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
