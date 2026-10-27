import * as Crypto from 'expo-crypto';
import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch, type SubmitErrorHandler } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Input, SegmentedControl, Select, Sheet, TextArea } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/i18n/types';

import {
  formValuesToNeedDraft,
  needDraftToFormValues,
} from '../services/need-draft';
import {
  NEED_FORMAT_LABEL_KEYS,
  NEED_FREQUENCY_LABEL_KEYS,
  NEED_SUBJECT_LABEL_KEYS,
} from '../lib/need-labels';
import {
  EMPTY_NEED_FORM_VALUES,
  NEED_FORMAT_VALUES,
  NEED_FREQUENCY_VALUES,
  NEED_SESSION_MINUTES,
  NEED_SUBJECT_SUGGESTIONS,
  type LearningNeedDraft,
  type NeedFormValues,
} from '../types';
import { needFormSchema, type ValidNeedFormValues } from '../validation';

const NEED_VALIDATION_KEYS = [
  'validation.need.subject',
  'validation.need.level',
  'validation.need.objective',
  'validation.need.frequency',
  'validation.need.sessionMinutes',
  'validation.need.availability',
  'validation.need.format',
  'validation.need.location',
  'validation.need.notes',
] as const satisfies readonly TranslationKey[];

const FIELD_ORDER = [
  'subject',
  'level',
  'objective',
  'frequency',
  'sessionMinutes',
  'availability',
  'format',
  'location',
  'notes',
] as const satisfies readonly (keyof NeedFormValues)[];

function isNeedValidationKey(value: string): value is (typeof NEED_VALIDATION_KEYS)[number] {
  return NEED_VALIDATION_KEYS.some((key) => key === value);
}

export interface NeedFormProps {
  readonly need?: LearningNeedDraft;
  readonly onCancel: () => void;
  readonly onSave: (need: LearningNeedDraft, isNew: boolean) => void;
}

export function NeedForm({
  need,
  onCancel,
  onSave,
}: NeedFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const defaultValues = useMemo(
    () => (need === undefined ? EMPTY_NEED_FORM_VALUES : needDraftToFormValues(need)),
    [need],
  );
  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { isSubmitting },
  } = useForm<NeedFormValues, undefined, ValidNeedFormValues>({
    defaultValues,
    resolver: zodResolver(needFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });
  const format = useWatch({ control, name: 'format' });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const frequencyOptions = useMemo(
    () =>
      NEED_FREQUENCY_VALUES.map((frequency) => ({
        value: frequency,
        label: t(NEED_FREQUENCY_LABEL_KEYS[frequency]),
      })),
    [t],
  );
  const sessionOptions = useMemo(
    () =>
      NEED_SESSION_MINUTES.map((minutes) => ({
        value: String(minutes),
        label: t('need.sessionMinutesSummary', { minutes }),
      })),
    [t],
  );
  const formatOptions = useMemo(
    () =>
      NEED_FORMAT_VALUES.map((format) => ({
        value: format,
        label: t(NEED_FORMAT_LABEL_KEYS[format]),
      })),
    [t],
  );

  const errorText = (message: string | undefined): string | undefined => {
    if (message === undefined) {
      return undefined;
    }

    return isNeedValidationKey(message) ? t(message) : t('error.unknown');
  };

  const handleInvalid: SubmitErrorHandler<NeedFormValues> = (formErrors) => {
    const firstInvalidField = FIELD_ORDER.find((field) => formErrors[field] !== undefined);
    if (firstInvalidField !== undefined) {
      setFocus(firstInvalidField);
    }
  };

  const handleValid = (values: ValidNeedFormValues) => {
    const now = Date.now();
    const needId = need?.id ?? `ned_${Crypto.randomUUID()}`;
    onSave(
      formValuesToNeedDraft(values, needId, now, need?.createdAt ?? now),
      need === undefined,
    );
  };

  return (
    <Sheet
      visible
      onClose={onCancel}
      title={t(need === undefined ? 'need.addTitle' : 'need.editTitle')}
      accessibilityLabel={t(need === undefined ? 'need.addTitle' : 'need.editTitle')}
      snapPoints={['92%']}
      testID="need-form-sheet"
      footer={
        <Button
          label={t('need.save')}
          onPress={() => void handleSubmit(handleValid, handleInvalid)()}
          loading={isSubmitting}
          fullWidth
          testID="need-save"
        />
      }
    >
      <ScrollView
        className="max-h-[78vh]"
        contentContainerClassName="gap-l pb-l"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="subject"
          render={({ field, fieldState }) => (
            <View className="gap-s">
              <Input
                label={t('need.subject')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                required
                maxLength={80}
                errorText={errorText(fieldState.error?.message)}
                testID="need-subject"
              />
              <ScrollView
                horizontal
                contentContainerClassName="gap-s"
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
              >
                {NEED_SUBJECT_SUGGESTIONS.map((suggestion) => {
                  const label = t(NEED_SUBJECT_LABEL_KEYS[suggestion]);
                  return (
                    <Pressable
                      key={suggestion}
                      accessibilityRole="button"
                      accessibilityLabel={label}
                      onPress={() => field.onChange(label)}
                      className="min-h-[44px] justify-center rounded-button bg-surface-container px-s"
                      testID={`need-subject-suggestion-${suggestion}`}
                    >
                      <Text className="text-label-medium text-on-surface">{label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        />
        <Controller
          control={control}
          name="level"
          render={({ field, fieldState }) => (
            <Input
              label={t('need.level')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              required
              maxLength={60}
              errorText={errorText(fieldState.error?.message)}
              testID="need-level"
            />
          )}
        />
        <Controller
          control={control}
          name="objective"
          render={({ field, fieldState }) => (
            <TextArea
              label={t('need.objective')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              required
              maxLength={400}
              errorText={errorText(fieldState.error?.message)}
              testID="need-objective"
            />
          )}
        />
        <Controller
          control={control}
          name="frequency"
          render={({ field, fieldState }) => (
            <Select
              label={t('need.frequency')}
              value={field.value}
              options={frequencyOptions}
              onChange={field.onChange}
              onBlur={field.onBlur}
              triggerRef={field.ref}
              placeholder={t('need.frequencyPlaceholder')}
              sheetTitle={t('need.frequency')}
              cancelLabel={t('common.cancel')}
              required
              errorText={errorText(fieldState.error?.message)}
              testID="need-frequency"
            />
          )}
        />
        <Controller
          control={control}
          name="sessionMinutes"
          render={({ field, fieldState }) => (
            <Select
              label={t('need.sessionMinutes')}
              value={field.value}
              options={sessionOptions}
              onChange={field.onChange}
              onBlur={field.onBlur}
              triggerRef={field.ref}
              placeholder={t('need.sessionMinutesPlaceholder')}
              sheetTitle={t('need.sessionMinutes')}
              cancelLabel={t('common.cancel')}
              required
              errorText={errorText(fieldState.error?.message)}
              testID="need-session-minutes"
            />
          )}
        />
        <Controller
          control={control}
          name="availability"
          render={({ field, fieldState }) => (
            <TextArea
              label={t('need.availability')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              required
              maxLength={300}
              errorText={errorText(fieldState.error?.message)}
              testID="need-availability"
            />
          )}
        />
        <Controller
          control={control}
          name="format"
          render={({ field, fieldState }) => (
            <View className="gap-s">
              <Text className="text-label-large text-on-surface">
                {t('need.format')}
                <Text className="text-error"> *</Text>
              </Text>
              <SegmentedControl
                value={field.value}
                options={formatOptions}
                onChange={field.onChange}
                onBlur={field.onBlur}
                triggerRef={field.ref}
                accessibilityLabel={t('need.format')}
                testID="need-format"
              />
              {fieldState.error?.message !== undefined ? (
                <Text accessibilityRole="alert" className="text-body-small text-error">
                  {errorText(fieldState.error.message)}
                </Text>
              ) : null}
            </View>
          )}
        />
        {format === 'home' || format === 'center' ? (
          <Controller
            control={control}
            name="location"
            render={({ field, fieldState }) => (
              <Input
                label={t('need.location')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                required
                maxLength={120}
                errorText={errorText(fieldState.error?.message)}
                testID="need-location"
              />
            )}
          />
        ) : null}
        <Controller
          control={control}
          name="notes"
          render={({ field, fieldState }) => (
            <TextArea
              label={t('need.notes')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              helperText={t('common.optional')}
              maxLength={500}
              errorText={errorText(fieldState.error?.message)}
              testID="need-notes"
            />
          )}
        />
      </ScrollView>
    </Sheet>
  );
}
