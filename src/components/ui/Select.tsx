import { Check, ChevronDown } from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from './Button';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  sheetTitle?: string;
  cancelLabel: string;
  triggerRef?: React.Ref<React.ElementRef<typeof Pressable>>;
  accessibilityLabel?: string;
  className?: string;
  testID?: string;
}

export function Select({
  label,
  value,
  options,
  onChange,
  onBlur,
  placeholder,
  helperText,
  errorText,
  required = false,
  disabled = false,
  sheetTitle,
  cancelLabel,
  triggerRef,
  accessibilityLabel,
  className,
  testID,
}: SelectProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const hasError = errorText !== undefined && errorText !== '';
  const supportText = hasError ? errorText : helperText;
  const selected = options.find((option) => option.value === value);
  const displayValue = selected?.label ?? placeholder;

  function handleSelect(optionValue: string): void {
    onChange(optionValue);
    setOpen(false);
  }

  return (
    <View className={className ?? ''}>
      {label !== undefined ? (
        <Text className="mb-s text-label-large text-on-surface">
          {label}
          {required ? <Text className="text-error"> *</Text> : null}
        </Text>
      ) : null}
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={supportText}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        onBlur={onBlur}
        className={[
          'min-h-[52px] flex-row items-center justify-between gap-s rounded-field border px-l',
          hasError ? 'border-error bg-surface' : 'border-outline bg-surface',
          disabled ? 'opacity-40' : '',
        ].join(' ')}
        testID={testID}
      >
        <Text
          className={[
            'flex-1 text-body-large',
            selected === undefined ? 'text-outline' : 'text-on-surface',
          ].join(' ')}
        >
          {displayValue ?? ''}
        </Text>
        <Icon icon={ChevronDown} size={20} color="on-surface-variant" />
      </Pressable>
      {supportText !== undefined && supportText !== '' ? (
        <Text
          accessibilityRole="alert"
          className={['mt-s text-body-small', hasError ? 'text-error' : 'text-on-surface-variant'].join(' ')}
        >
          {supportText}
        </Text>
      ) : null}
      <Sheet
        visible={open}
        presentation="modal"
        onClose={() => setOpen(false)}
        title={sheetTitle ?? label}
        accessibilityLabel={sheetTitle ?? label}
        dismissLabel={cancelLabel}
        testID={testID === undefined ? undefined : `${testID}-sheet`}
        footer={
          <Button label={cancelLabel} variant="tonal" onPress={() => setOpen(false)} />
        }
      >
        <View>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={option.label}
                onPress={() => handleSelect(option.value)}
                className="min-h-[56px] flex-row items-center justify-between gap-s border-b border-outline-variant py-s"
              >
                <View className="flex-1">
                  <Text className="text-body-large text-on-surface">{option.label}</Text>
                  {option.description !== undefined ? (
                    <Text className="text-body-small text-on-surface-variant">
                      {option.description}
                    </Text>
                  ) : null}
                </View>
                {isSelected ? <Icon icon={Check} size={20} color="primary" /> : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}
