import { Check } from 'lucide-react-native';
import type React from 'react';
import { Text, View } from 'react-native';

import { Icon } from './Icon';

export type TimelineStatus = 'done' | 'current' | 'upcoming';

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  dateLabel?: string;
  status?: TimelineStatus;
}

export interface TimelineProps {
  entries: readonly TimelineEntry[];
  className?: string;
  testID?: string;
}

export function Timeline({ entries, className, testID }: TimelineProps): React.JSX.Element {
  return (
    <View className={className ?? ''} testID={testID}>
      {entries.map((entry, index) => {
        const status = entry.status ?? 'upcoming';
        const isLast = index === entries.length - 1;

        return (
          <View key={entry.id} className="flex-row gap-m">
            <View className="items-center">
              <View
                className={[
                  'h-[24px] w-[24px] items-center justify-center rounded-full border-2',
                  status === 'done'
                    ? 'border-primary bg-primary'
                    : status === 'current'
                      ? 'border-primary bg-surface'
                      : 'border-outline-variant bg-surface',
                ].join(' ')}
              >
                {status === 'done' ? (
                  <Icon icon={Check} size={14} color="on-primary" />
                ) : null}
              </View>
              {isLast ? null : <View className="w-[2px] flex-1 bg-outline-variant" />}
            </View>
            <View className="flex-1 pb-l">
              <View className="flex-row items-baseline justify-between gap-s">
                <Text
                  className={[
                    'text-body-large',
                    status === 'upcoming' ? 'text-on-surface-variant' : 'text-on-surface',
                  ].join(' ')}
                >
                  {entry.title}
                </Text>
                {entry.dateLabel !== undefined ? (
                  <Text className="text-body-small text-on-surface-variant">{entry.dateLabel}</Text>
                ) : null}
              </View>
              {entry.description !== undefined ? (
                <Text className="text-body-small text-on-surface-variant">{entry.description}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
