import type React from 'react';
import { useState } from 'react';
import type { NativeSyntheticEvent, TextInputContentSizeChangeEventData } from 'react-native';
import { Text, TextInput, View } from 'react-native';

import { themeColor } from '@/lib/theme';

export interface TextAreaProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minHeight?: number;
  maxHeight?: number;
  accessibilityLabel?: string;
  className?: string;
  testID?: string;
}

export function TextArea({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  errorText,
  required = false,
  disabled = false,
  maxLength,
  minHeight = 120,
  maxHeight = 240,
  accessibilityLabel,
  className,
  testID,
}: TextAreaProps): React.JSX.Element {
  const [height, setHeight] = useState(minHeight);
  const hasError = errorText !== undefined && errorText !== '';
  const supportText = hasError ? errorText : helperText;

  function handleContentSizeChange(
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ): void {
    const contentHeight = event.nativeEvent.contentSize.height;
    setHeight(Math.min(Math.max(contentHeight, minHeight), maxHeight));
  }

  return (
    <View className={className ?? ''}>
      {label !== undefined ? (
        <Text className="mb-s text-label-large text-on-surface">
          {label}
          {required ? <Text className="text-error"> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={supportText}
        accessibilityState={{ disabled }}
        value={value}
        onChangeText={onChangeText}
        onContentSizeChange={handleContentSizeChange}
        placeholder={placeholder}
        placeholderTextColor={themeColor('outline')}
        maxLength={maxLength}
        editable={!disabled}
        multiline
        textAlignVertical="top"
        style={{ height }}
        className={[
          'rounded-field border px-l py-s text-body-large text-on-surface',
          hasError ? 'border-error bg-surface' : 'border-outline bg-surface',
          disabled ? 'opacity-40' : '',
        ].join(' ')}
        testID={testID}
      />
      {supportText !== undefined && supportText !== '' ? (
        <Text
          accessibilityRole="alert"
          className={['mt-s text-body-small', hasError ? 'text-error' : 'text-on-surface-variant'].join(' ')}
        >
          {supportText}
        </Text>
      ) : null}
      {maxLength !== undefined ? (
        <Text className="mt-xs text-right text-body-small text-on-surface-variant">
          {`${value.length}/${maxLength}`}
        </Text>
      ) : null}
    </View>
  );
}
