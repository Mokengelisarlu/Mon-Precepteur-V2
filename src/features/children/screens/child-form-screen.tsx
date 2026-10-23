import * as Crypto from 'expo-crypto';
import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, type SubmitErrorHandler } from 'react-hook-form';
import { ScrollView } from 'react-native';

import { Button, Input, Select, Sheet, TextArea } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/i18n/types';

import {
  childDraftToFormValues,
  formValuesToChildDraft,
} from '../services/child-draft';
import {
  CHILD_LEVEL_VALUES,
  type ChildDraftRecord,
  type ChildFormValues,
} from '../types';
import { childFormSchema, type ValidChildFormValues } from '../validation';

const CHILD_VALIDATION_KEYS = [
  'validation.child.firstName',
  'validation.child.lastName',
  'validation.child.yearOfBirth',
  'validation.child.level',
  'validation.child.school',
  'validation.child.notes',
] as const satisfies readonly TranslationKey[];

function isChildValidationKey(value: string): value is (typeof CHILD_VALIDATION_KEYS)[number] {
  return CHILD_VALIDATION_KEYS.some((key) => key === value);
}

const FIELD_ORDER = [
  'firstName',
  'lastName',
  'yearOfBirth',
  'level',
  'school',
  'notes',
] as const satisfies readonly (keyof ChildFormValues)[];

export interface ChildFormScreenProps {
  readonly child?: ChildDraftRecord;
  readonly onCancel: () => void;
  readonly onSave: (child: ChildDraftRecord, isNew: boolean) => void;
}

export function ChildFormScreen({
  child,
  onCancel,
  onSave,
}: ChildFormScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const defaultValues = useMemo(() => childDraftToFormValues(child), [child]);
  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { isSubmitting },
  } = useForm<ChildFormValues>({
    defaultValues,
    resolver: zodResolver(childFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const levelOptions = useMemo(
    () => [
      ...CHILD_LEVEL_VALUES.filter((level) => level !== 'other').map((level) => ({
        value: level,
        label: `${t(level.startsWith('P') ? 'child.primary' : 'child.secondary')} · ${level}`,
      })),
      { value: 'other', label: t('child.otherLevel') },
    ],
    [t],
  );

  const errorText = (message: string | undefined): string | undefined => {
    if (message === undefined) {
      return undefined;
    }

    return isChildValidationKey(message) ? t(message) : t('error.unknown');
  };

  const handleInvalid: SubmitErrorHandler<ChildFormValues> = (formErrors) => {
    const firstInvalidField = FIELD_ORDER.find((field) => formErrors[field] !== undefined);
    if (firstInvalidField !== undefined) {
      setFocus(firstInvalidField);
    }
  };

  const handleValid = (values: ValidChildFormValues) => {
    const now = Date.now();
    const childId = child?.id ?? `chd_${Crypto.randomUUID()}`;
    const nextChild = formValuesToChildDraft(
      values,
      childId,
      now,
      child?.createdAt ?? now,
    );

    onSave(nextChild, child === undefined);
  };

  return (
    <Sheet
      visible
      onClose={onCancel}
      title={t(child === undefined ? 'child.addTitle' : 'child.editTitle')}
      accessibilityLabel={t(child === undefined ? 'child.addTitle' : 'child.editTitle')}
      snapPoints={['88%']}
      testID="child-form-sheet"
      footer={
        <Button
          label={t('child.save')}
          onPress={() => void handleSubmit(handleValid, handleInvalid)()}
          loading={isSubmitting}
          fullWidth
          testID="child-save"
        />
      }
    >
      <ScrollView
        className="max-h-[75vh]"
        contentContainerClassName="gap-l pb-l"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="firstName"
          render={({ field, fieldState }) => (
            <Input
              label={t('child.firstName')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              required
              maxLength={60}
              errorText={errorText(fieldState.error?.message)}
              testID="child-first-name"
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field, fieldState }) => (
            <Input
              label={t('child.lastName')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              helperText={t('child.optional')}
              maxLength={60}
              errorText={errorText(fieldState.error?.message)}
              testID="child-last-name"
            />
          )}
        />
        <Controller
          control={control}
          name="yearOfBirth"
          render={({ field, fieldState }) => (
            <Input
              label={t('child.yearOfBirth')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              keyboardType="number-pad"
              required
              maxLength={4}
              helperText={t('child.yearOfBirthHint')}
              errorText={errorText(fieldState.error?.message)}
              testID="child-year-of-birth"
            />
          )}
        />
        <Controller
          control={control}
          name="level"
          render={({ field, fieldState }) => (
            <Select
              label={t('child.level')}
              value={field.value}
              options={levelOptions}
              onChange={field.onChange}
              onBlur={field.onBlur}
              triggerRef={field.ref}
              placeholder={t('child.levelPlaceholder')}
              sheetTitle={t('child.levelPickerTitle')}
              cancelLabel={t('common.cancel')}
              required
              errorText={errorText(fieldState.error?.message)}
              testID="child-level"
            />
          )}
        />
        <Controller
          control={control}
          name="school"
          render={({ field, fieldState }) => (
            <Input
              label={t('child.school')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              helperText={t('child.optional')}
              maxLength={80}
              errorText={errorText(fieldState.error?.message)}
              testID="child-school"
            />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field, fieldState }) => (
            <TextArea
              label={t('child.notes')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              helperText={t('child.optional')}
              maxLength={500}
              errorText={errorText(fieldState.error?.message)}
              testID="child-notes"
            />
          )}
        />
      </ScrollView>
    </Sheet>
  );
}
