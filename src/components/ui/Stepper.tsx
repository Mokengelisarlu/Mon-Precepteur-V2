import type React from 'react';
import { Text, View } from 'react-native';

export interface StepperProps {
  steps: readonly string[];
  currentIndex: number;
  className?: string;
  testID?: string;
}

export function Stepper({ steps, currentIndex, className, testID }: StepperProps): React.JSX.Element {
  return (
    <View className={className ?? ''} testID={testID}>
      <View className="flex-row items-center">
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <View key={`step-${index}`} className="flex-1 flex-row items-center">
              <View className="items-center">
                <View
                  className={[
                    'h-[28px] w-[28px] items-center justify-center rounded-full border-2',
                    isDone ? 'border-primary bg-primary' : '',
                    isCurrent ? 'border-primary bg-surface' : '',
                    !isDone && !isCurrent ? 'border-outline-variant bg-surface' : '',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-label-medium',
                      isDone ? 'text-on-primary' : 'text-on-surface-variant',
                    ].join(' ')}
                  >
                    {`${index + 1}`}
                  </Text>
                </View>
              </View>
              {isLast ? null : (
                <View
                  className={[
                    'mx-xs h-[2px] flex-1',
                    index < currentIndex ? 'bg-primary' : 'bg-outline-variant',
                  ].join(' ')}
                />
              )}
            </View>
          );
        })}
      </View>
      <View className="mt-s flex-row">
        {steps.map((step, index) => (
          <Text
            key={`step-label-${index}`}
            className={[
              'flex-1 text-center text-label-small',
              index === currentIndex ? 'text-primary' : 'text-on-surface-variant',
            ].join(' ')}
          >
            {step}
          </Text>
        ))}
      </View>
    </View>
  );
}
