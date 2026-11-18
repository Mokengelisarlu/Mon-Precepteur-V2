import type React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRef, useState } from 'react';

import { themeColor } from '@/lib/theme';

export type PinInputVariant = 'default' | 'brand';

export interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onComplete?: (value: string) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  secure?: boolean;
  variant?: PinInputVariant;
  invalid?: boolean;
  accessibilityLabel?: string;
  inputRef?: React.Ref<TextInput>;
  className?: string;
  testID?: string;
}

const DASH = themeColor('outline');

const styles = StyleSheet.create({
  cellsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 48,
    minWidth: 40,
    height: 46,
    borderWidth: 1,
    borderColor: themeColor('outline-variant'),
    borderRadius: 12,
    backgroundColor: themeColor('surface'),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  cellError: {
    borderColor: themeColor('error'),
    borderWidth: 2,
  },
  cellFocused: {
    borderColor: themeColor('primary'),
    borderWidth: 2,
  },
  digit: {
    fontSize: 22,
    fontWeight: '600',
    color: themeColor('on-surface'),
  },
  separator: {
    width: 16,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: themeColor('on-surface'),
  },
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
  onFocus,
  onBlur,
  onComplete,
  label,
  helperText,
  errorText,
  disabled = false,
  secure = false,
  variant = 'default',
  invalid = false,
  accessibilityLabel,
  inputRef: forwardedInputRef,
  className,
  testID,
}: PinInputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const hasError = invalid || (errorText !== undefined && errorText !== '');
  const supportText = hasError ? errorText : helperText;

  const showDash = length === 6;

  const renderCells = () => {
    const cells = [];
    const cellsPerGroup = 3;

    for (let i = 0; i < length; i++) {
      // Add separator after 3rd cell (index 3) for 6-digit PIN
      if (showDash && i === cellsPerGroup) {
        cells.push(
          <View
            key="pin-dash"
            style={styles.separator}
            testID={testID !== undefined ? `${testID}-dash` : undefined}
          >
            <Text style={{ color: DASH, fontSize: 24, lineHeight: 24, fontWeight: '300' }}>−</Text>
          </View>
        );
      }
      const cellValue = value[i] ?? '';
      const isCurrent = isFocused && i < value.length;
      const isCurrentAtEmpty = isFocused && value.length === i;

      const hasErrorBorder = hasError;
      const showFocusedBorder = isCurrent || isCurrentAtEmpty;

      cells.push(
        <View
          key={`pin-cell-${i}`}
          style={[
            styles.cell,
            hasErrorBorder && styles.cellError,
            showFocusedBorder && styles.cellFocused,
          ]}
          testID={testID !== undefined ? `${testID}-cell-${i}` : undefined}
        >
          {cellValue !== '' ? (
            <Text style={styles.digit}>
              {secure ? '•' : cellValue}
            </Text>
          ) : showFocusedBorder && variant === 'brand' ? (
            <View style={styles.cursor} />
          ) : null}
        </View>
      );
    }
    return cells;
  };

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
      <View style={styles.cellsContainer}>
        {renderCells()}
      </View>
      <TextInput
        ref={forwardedInputRef ?? inputRef}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={supportText}
        accessibilityState={{ disabled }}
        style={styles.overlay}
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        editable={!disabled}
        keyboardType="number-pad"
        secureTextEntry={secure}
        maxLength={length}
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
    </View>
  );
}