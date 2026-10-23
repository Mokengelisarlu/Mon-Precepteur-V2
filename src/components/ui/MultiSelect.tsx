import type React from 'react';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Sheet } from './Sheet';
import type { SelectOption } from './Select';

export interface MultiSelectProps {
  label?: string;
  values: readonly string[];
  options: readonly SelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  sheetTitle?: string;
  cancelLabel: string;
  confirmLabel: string;
  accessibilityLabel?: string;
  className?: string;
  testID?: string;
}

export function MultiSelect({
  label,
  values,
  options,
  onChange,
  placeholder,
  helperText,
  errorText,
  required = false,
  disabled = false,
  sheetTitle,
  cancelLabel,
  confirmLabel,
  accessibilityLabel,
  className,
  testID,
}: MultiSelectProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<readonly string[]>(values);
  const hasError = errorText !== undefined && errorText !== '';
  const supportText = hasError ? errorText : helperText;

  function handleOpen(): void {
    setDraft(values);
    setOpen(true);
  }

  function toggle(optionValue: string): void {
    setDraft((current) =>
      current.includes(optionValue)
        ? current.filter((entry) => entry !== optionValue)
        : [...current, optionValue],
    );
  }

  function handleConfirm(): void {
    onChange([...draft]);
    setOpen(false);
  }

  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

  const displayValue =
    selectedLabels.length > 0 ? selectedLabels.join(', ') : (placeholder ?? '');

  return (
    <View className={className ?? ''}>
      {label !== undefined ? (
        <Text className="mb-s text-label-large text-on-surface">
          {label}
          {required ? <Text className="text-error"> *</Text> : null}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={supportText}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={handleOpen}
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
            selectedLabels.length === 0 ? 'text-outline' : 'text-on-surface',
          ].join(' ')}
        >
          {displayValue}
        </Text>
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
          <View className="flex-row gap-s">
            <Button label={cancelLabel} variant="tonal" onPress={() => setOpen(false)} className="flex-1" />
            <Button label={confirmLabel} variant="filled" onPress={handleConfirm} className="flex-1" />
          </View>
        }
      >
        <View>
          {options.map((option) => (
            <Checkbox
              key={option.value}
              checked={draft.includes(option.value)}
              onToggle={() => toggle(option.value)}
              label={option.label}
            />
          ))}
        </View>
      </Sheet>
    </View>
  );
}
