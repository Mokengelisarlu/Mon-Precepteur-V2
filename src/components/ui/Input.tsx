import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { themeColor } from '@/lib/theme';

import { Icon } from './Icon';

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'off' | 'tel' | 'email' | 'name';
  secureTextEntry?: boolean;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  trailingIconLabel?: string;
  onTrailingIconPress?: () => void;
  maxLength?: number;
  inputRef?: React.Ref<TextInput>;
  accessibilityLabel?: string;
  className?: string;
  testID?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  helperText,
  errorText,
  required = false,
  disabled = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  secureTextEntry = false,
  leadingIcon,
  trailingIcon,
  trailingIconLabel,
  onTrailingIconPress,
  maxLength,
  inputRef,
  accessibilityLabel,
  className,
  testID,
}: InputProps): React.JSX.Element {
  const hasError = errorText !== undefined && errorText !== '';
  const supportText = hasError ? errorText : helperText;

  return (
    <View className={className ?? ''}>
      {label !== undefined ? (
        <Text className="mb-s text-label-large text-on-surface">
          {label}
          {required ? <Text className="text-error"> *</Text> : null}
        </Text>
      ) : null}
      <View
        className={[
          'flex-row items-center gap-s rounded-field border px-l',
          hasError ? 'border-error bg-surface' : 'border-outline bg-surface',
          disabled ? 'opacity-40' : '',
        ].join(' ')}
      >
        {leadingIcon ? <Icon icon={leadingIcon} size={20} color="on-surface-variant" /> : null}
        <TextInput
          ref={inputRef}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={supportText}
          accessibilityState={{ disabled }}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={themeColor('outline')}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          editable={!disabled}
          className="min-h-[52px] flex-1 py-s text-body-large text-on-surface"
          testID={testID}
        />
        {trailingIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trailingIconLabel ?? label ?? ''}
            accessibilityState={{ disabled: disabled || onTrailingIconPress === undefined }}
            disabled={disabled || onTrailingIconPress === undefined}
            onPress={onTrailingIconPress}
            className="h-[44px] w-[44px] items-center justify-center"
          >
            <Icon icon={trailingIcon} size={20} color="on-surface-variant" />
          </Pressable>
        ) : null}
      </View>
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
