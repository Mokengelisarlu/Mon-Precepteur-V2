import type React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTranslation } from '@/hooks/use-translation';

import { TUTOR_PREFERENCE_LABEL_KEYS } from '../lib/need-labels';
import { TUTOR_PREFERENCE_VALUES, type TutorPreference } from '../types';

export interface TutorPreferenceControlProps {
  readonly value: TutorPreference;
  readonly onChange: (value: TutorPreference) => void;
}

export function TutorPreferenceControl({
  value,
  onChange,
}: TutorPreferenceControlProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View className="gap-s">
      <Text accessibilityRole="header" className="text-title-medium text-on-surface">
        {t('need.tutorPreference')}
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('need.tutorPreference')}
        accessibilityHint={t('need.tutorPreferenceNote')}
        className="gap-xs"
        testID="tutor-preference-options"
      >
        {TUTOR_PREFERENCE_VALUES.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityLabel={t(TUTOR_PREFERENCE_LABEL_KEYS[option])}
            accessibilityState={{ checked: value === option }}
            onPress={() => onChange(option)}
            className="min-h-[48px] flex-row items-center gap-s rounded-card border border-outline-variant px-l"
            testID={`tutor-preference-${option}`}
          >
            <View
              className={[
                'h-5 w-5 items-center justify-center rounded-full border',
                value === option ? 'border-primary' : 'border-outline',
              ].join(' ')}
            >
              {value === option ? <View className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
            </View>
            <Text className="flex-1 text-body-medium text-on-surface">
              {t(TUTOR_PREFERENCE_LABEL_KEYS[option])}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text className="text-body-small text-on-surface-variant">
        {t('need.tutorPreferenceNote')}
      </Text>
      <Text className="text-body-small text-on-surface-variant">
        {t('need.tutorAssignmentHint')}
      </Text>
    </View>
  );
}
