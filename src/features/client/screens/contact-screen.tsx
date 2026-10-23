import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type SubmitErrorHandler } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, Sheet, Stepper } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/i18n/types';

import { findClientByPhone } from '../services/find-client-by-phone';
import {
  EMPTY_CONTACT_FORM_VALUES,
  type ClientContactDetails,
  type ClientProfile,
  type ContactFormValues,
} from '../types';
import { contactFormSchema, type ValidContactDetails } from '../validation';

const CONTACT_VALIDATION_KEYS = [
  'validation.contact.firstName',
  'validation.contact.lastName',
  'validation.contact.phone',
  'validation.contact.email',
  'validation.contact.address',
] as const satisfies readonly TranslationKey[];

const FIELD_ORDER = [
  'firstName',
  'lastName',
  'phone',
  'email',
  'address',
] as const satisfies readonly (keyof ContactFormValues)[];

function isContactValidationKey(
  value: string,
): value is (typeof CONTACT_VALIDATION_KEYS)[number] {
  return CONTACT_VALIDATION_KEYS.some((key) => key === value);
}

export interface ContactScreenProps {
  readonly isAdultJourney: boolean;
  readonly contact?: ClientContactDetails | null;
  readonly clientId?: string | null;
  readonly clients: readonly ClientProfile[];
  readonly onBack: () => void;
  readonly onContinue: (contact: ValidContactDetails) => void;
  readonly onContinueExisting: (client: ClientProfile) => void;
}

export function ContactScreen({
  isAdultJourney,
  contact,
  clientId,
  clients,
  onBack,
  onContinue,
  onContinueExisting,
}: ContactScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const [duplicateClient, setDuplicateClient] = useState<ClientProfile | null>(null);
  const defaultValues = useMemo<ContactFormValues>(
    () => ({
      firstName: contact?.firstName ?? EMPTY_CONTACT_FORM_VALUES.firstName,
      lastName: contact?.lastName ?? EMPTY_CONTACT_FORM_VALUES.lastName,
      phone: contact?.phone ?? EMPTY_CONTACT_FORM_VALUES.phone,
      email: contact?.email ?? EMPTY_CONTACT_FORM_VALUES.email,
      address: contact?.address ?? EMPTY_CONTACT_FORM_VALUES.address,
    }),
    [contact],
  );
  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { isSubmitting },
  } = useForm<ContactFormValues, undefined, ValidContactDetails>({
    defaultValues,
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const steps =
    !isAdultJourney
      ? [
          t('nav.children'),
          t('children.stepNeeds'),
          t('children.stepContact'),
          t('nav.pin'),
        ]
      : [t('children.stepNeeds'), t('children.stepContact'), t('nav.pin')];

  const handleInvalid: SubmitErrorHandler<ContactFormValues> = (formErrors) => {
    const firstInvalidField = FIELD_ORDER.find((field) => formErrors[field] !== undefined);
    if (firstInvalidField !== undefined) {
      setFocus(firstInvalidField);
    }
  };

  const handleValid = (values: ValidContactDetails) => {
    const existingClient = findClientByPhone(clients, values.phone);
    if (existingClient !== undefined && existingClient.id !== clientId) {
      setDuplicateClient(existingClient);
      return;
    }

    onContinue(values);
  };

  const errorText = (message: string | undefined): string | undefined => {
    if (message === undefined) {
      return undefined;
    }

    return isContactValidationKey(message) ? t(message) : t('error.unknown');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="contact-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-l px-l pb-xl pt-l"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID="contact-scroll"
      >
        <Button
          label={t('common.back')}
          onPress={onBack}
          variant="text"
          className="self-start"
          testID="contact-back"
        />
        <Stepper steps={steps} currentIndex={steps.length - 2} testID="contact-stepper" />
        <View className="gap-xs">
          <Text accessibilityRole="header" className="text-headline-small text-on-surface">
            {t('contact.title')}
          </Text>
          <Text className="text-body-medium text-on-surface-variant">
            {t('contact.subtitle')}
          </Text>
        </View>
        <Controller
          control={control}
          name="firstName"
          render={({ field, fieldState }) => (
            <Input
              label={t('contact.firstName')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              autoCapitalize="words"
              autoComplete="name"
              required
              maxLength={60}
              errorText={errorText(fieldState.error?.message)}
              testID="contact-first-name"
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field, fieldState }) => (
            <Input
              label={t('contact.lastName')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              autoCapitalize="words"
              autoComplete="name"
              required
              maxLength={60}
              errorText={errorText(fieldState.error?.message)}
              testID="contact-last-name"
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Input
              label={t('contact.phone')}
              value={field.value}
              onChangeText={(value) => {
                setDuplicateClient(null);
                field.onChange(value);
              }}
              onBlur={field.onBlur}
              inputRef={field.ref}
              keyboardType="phone-pad"
              autoComplete="tel"
              helperText={t('contact.phoneHint')}
              required
              errorText={errorText(fieldState.error?.message)}
              testID="contact-phone"
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label={t('contact.emailOptional')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              errorText={errorText(fieldState.error?.message)}
              testID="contact-email"
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field, fieldState }) => (
            <Input
              label={t('contact.addressOptional')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              autoCapitalize="words"
              maxLength={120}
              errorText={errorText(fieldState.error?.message)}
              testID="contact-address"
            />
          )}
        />
      </ScrollView>
      <View className="border-t border-outline-variant bg-surface px-l pb-l pt-s">
        <Button
          label={t('common.continue')}
          onPress={() => {
            void handleSubmit(handleValid, handleInvalid)();
          }}
          loading={isSubmitting}
          fullWidth
          testID="contact-continue"
        />
      </View>
      <Sheet
        visible={duplicateClient !== null}
        onClose={() => setDuplicateClient(null)}
        title={t('contact.duplicateTitle')}
        accessibilityLabel={t('contact.duplicateTitle')}
        presentation="modal"
        testID="contact-duplicate-sheet"
        footer={
          <View className="gap-s">
            <Button
              label={t('common.continue')}
              onPress={() => {
                if (duplicateClient !== null) {
                  onContinueExisting(duplicateClient);
                  setDuplicateClient(null);
                }
              }}
              fullWidth
              testID="contact-duplicate-continue"
            />
            <Button
              label={t('contact.useAnotherNumber')}
              onPress={() => {
                setDuplicateClient(null);
                setFocus('phone');
              }}
              variant="text"
              fullWidth
              testID="contact-use-another"
            />
          </View>
        }
      >
        <Text className="text-body-medium text-on-surface">
          {t('contact.duplicateMessage')}
        </Text>
      </Sheet>
    </SafeAreaView>
  );
}
