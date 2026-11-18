import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { Controller, useForm, type SubmitErrorHandler } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/feedback/ToastHost';
import { Button, Card, PinInput, Stepper } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/i18n/types';

import type { PinFormValues } from '../validation';
import { pinFormSchema, pinVerificationSchema } from '../validation';

const PIN_VALIDATION_KEYS = [
  'validation.pin.format',
  'validation.pin.mismatch',
  'validation.pin.incorrect',
] as const satisfies readonly TranslationKey[];

const PIN_FIELD_ORDER = ['pin', 'pinConfirm'] as const satisfies readonly (keyof PinFormValues)[];

function isPinValidationKey(value: string): value is (typeof PIN_VALIDATION_KEYS)[number] {
  return PIN_VALIDATION_KEYS.some((key) => key === value);
}

export interface PinScreenProps {
  readonly isAdultJourney: boolean;
  readonly isExistingClient: boolean;
  readonly onBack: () => void;
  readonly onCreatePin: (pin: string) => Promise<void>;
  readonly onVerifyPin: (pin: string) => Promise<boolean>;
}

export function PinScreen({
  isAdultJourney,
  isExistingClient,
  onBack,
  onCreatePin,
  onVerifyPin,
}: PinScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const schema = isExistingClient ? pinVerificationSchema : pinFormSchema;
  const {
    control,
    clearErrors,
    handleSubmit,
    setError,
    setFocus,
    formState: { isSubmitting },
  } = useForm<PinFormValues>({
    defaultValues: { pin: '', pinConfirm: '' },
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const steps = isAdultJourney
    ? [t('children.stepNeeds'), t('children.stepContact'), t('nav.pin')]
    : [t('nav.childForm'), t('children.stepContact'), t('nav.pin')];
  const title = t(isExistingClient ? 'pin.verifyTitle' : 'pin.createTitle');

  const handleInvalid: SubmitErrorHandler<PinFormValues> = (formErrors) => {
    const firstInvalidField = PIN_FIELD_ORDER.find((field) => formErrors[field] !== undefined);
    if (firstInvalidField !== undefined) {
      setFocus(firstInvalidField);
    }
  };

  const handleValid = async (values: PinFormValues): Promise<void> => {
    try {
      if (isExistingClient) {
        const isValid = await onVerifyPin(values.pin);
        if (!isValid) {
          setError('pin', { type: 'validate', message: 'validation.pin.incorrect' });
          setFocus('pin');
          return;
        }
      } else {
        await onCreatePin(values.pin);
      }
    } catch {
      showToast({
        message: t(isExistingClient ? 'error.pinVerify' : 'error.pinSave'),
        variant: 'error',
      });
    }
  };

  const errorText = (message: string | undefined): string | undefined => {
    if (message === undefined) {
      return undefined;
    }

    return isPinValidationKey(message) ? t(message) : t('error.unknown');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="pin-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-l px-l pb-xl pt-l"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID="pin-scroll"
      >
        <Button
          label={t('common.back')}
          onPress={onBack}
          variant="text"
          className="self-start"
          testID="pin-back"
        />
        <Stepper steps={steps} currentIndex={steps.length - 1} testID="pin-stepper" />
        <View className="gap-xs">
          <Text accessibilityRole="header" className="text-headline-small text-on-surface">
            {title}
          </Text>
          <Text className="text-body-medium text-on-surface-variant">
            {t(isExistingClient ? 'pin.verifyHint' : 'pin.createHint')}
          </Text>
        </View>
        <Controller
          control={control}
          name="pin"
          render={({ field, fieldState }) => (
            <PinInput
              label={t('pin.accessCode')}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                if (fieldState.error !== undefined) {
                  clearErrors('pin');
                }
              }}
              onBlur={field.onBlur}
              inputRef={field.ref}
              errorText={errorText(fieldState.error?.message)}
              secure
              length={6}
              accessibilityLabel={t('pin.accessCode')}
              testID="pin-entry"
            />
          )}
        />
        {!isExistingClient ? (
          <Controller
            control={control}
            name="pinConfirm"
            render={({ field, fieldState }) => (
              <PinInput
                label={t('pin.confirmCode')}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (fieldState.error !== undefined) {
                    clearErrors('pinConfirm');
                  }
                }}
                onBlur={field.onBlur}
                inputRef={field.ref}
                errorText={errorText(fieldState.error?.message)}
                secure
                length={6}
                accessibilityLabel={t('pin.confirmCode')}
                testID="pin-confirm"
              />
            )}
          />
        ) : null}
        <View
          accessible
          accessibilityRole="summary"
          accessibilityLabel={t('pin.infoTitle')}
          testID="pin-information"
        >
          <Card title={t('pin.infoTitle')}>
            <Text className="mt-s text-body-medium text-on-surface">
              {t('pin.purpose')}
            </Text>
            <Text className="mt-s text-body-small text-on-surface-variant">
              {t('pin.demoNotice')}
            </Text>
          </Card>
        </View>
      </ScrollView>
      <View className="border-t border-outline-variant bg-surface px-l pb-l pt-s">
        <Button
          label={t('common.continue')}
          onPress={() => {
            void handleSubmit(handleValid, handleInvalid)();
          }}
          loading={isSubmitting}
          fullWidth
          testID="pin-continue"
        />
      </View>
    </SafeAreaView>
  );
}
