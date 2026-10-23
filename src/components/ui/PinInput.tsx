import type React from 'react';
import { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onComplete?: (value: string) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  secure?: boolean;
  accessibilityLabel?: string;
  inputRef?: React.Ref<TextInput>;
  className?: string;
  testID?: string;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
});

export function PinInput({
  length = 4,
  value,
  onChange,
  onBlur,
  onComplete,
  label,
  helperText,
  errorText,
  disabled = false,
  secure = false,
  accessibilityLabel,
  inputRef: forwardedInputRef,
  className,
  testID,
}: PinInputProps): React.JSX.Element {
  const inputRef = useRef<TextInput>(null);
  const hasError = errorText !== undefined && errorText !== '';
  const supportText = hasError ? errorText : helperText;
  const cells = Array.from({ length }, (_, index) => value[index] ?? '');

  function handleChangeText(text: string): void {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (onComplete !== undefined && digits.length === length) {
      onComplete(digits);
    }
  }

  return (
    <View className={className ?? ''}>
      {label !== undefined ? (
        <Text className="mb-s text-label-large text-on-surface">{label}</Text>
      ) : null}
      <View
        className={['flex-row justify-between gap-s', disabled ? 'opacity-40' : ''].join(' ')}
      >
        {cells.map((cell, index) => (
          <View
            key={`pin-cell-${index}`}
            className={[
              'h-[56px] flex-1 items-center justify-center rounded-field border bg-surface',
              hasError ? 'border-error' : 'border-outline',
            ].join(' ')}
          >
            <Text className="text-title-large text-on-surface">
              {cell === '' ? '' : secure ? '•' : cell}
            </Text>
          </View>
        ))}
        <TextInput
          ref={forwardedInputRef ?? inputRef}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={supportText}
          accessibilityState={{ disabled }}
          style={styles.overlay}
          value={value}
          onChangeText={handleChangeText}
          onBlur={onBlur}
          editable={!disabled}
          keyboardType="number-pad"
          secureTextEntry={secure}
          maxLength={length}
          testID={testID}
        />
      </View>
      {supportText !== undefined && supportText !== '' ? (
        <Text
          accessibilityRole="alert"
          className={['mt-s text-body-small', hasError ? 'text-error' : 'text-on-surface-variant'].join(' ')}
        >
          {supportText}
        </Text>
      ) : null}
    </View>
  );
}
