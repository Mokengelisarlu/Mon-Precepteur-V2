import { ChevronLeft, MapPin, UserRound } from 'lucide-react-native';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, type SubmitErrorHandler } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Icon, Input, Select, Sheet } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/i18n/types';

import { DRC_CITIES } from '../drc-cities';
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

const IDENTITY_FIELDS = ['lastName', 'firstName', 'phone', 'email'] as const;
const ADDRESS_FIELDS = ['city', 'commune', 'quartier', 'avenue', 'number'] as const;
const FIELD_ORDER = [...IDENTITY_FIELDS, ...ADDRESS_FIELDS] as const;

function isContactValidationKey(
  value: string,
): value is (typeof CONTACT_VALIDATION_KEYS)[number] {
  return CONTACT_VALIDATION_KEYS.some((key) => key === value);
}

export interface ContactScreenProps {
  readonly contact?: ClientContactDetails | null;
  readonly clientId?: string | null;
  readonly clients: readonly ClientProfile[];
  readonly onBack: () => void;
  readonly onContinue: (contact: ValidContactDetails) => void;
  readonly onContinueExisting: (
    client: ClientProfile,
    contact: ValidContactDetails,
  ) => void;
}

interface DuplicateConfirmation {
  readonly client: ClientProfile;
  readonly contact: ValidContactDetails;
}

export function ContactScreen({
  contact,
  clientId,
  clients,
  onBack,
  onContinue,
  onContinueExisting,
}: ContactScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [duplicateConfirmation, setDuplicateConfirmation] =
    useState<DuplicateConfirmation | null>(null);
  const defaultValues = useMemo<ContactFormValues>(
    () => ({
      firstName: contact?.firstName ?? EMPTY_CONTACT_FORM_VALUES.firstName,
      lastName: contact?.lastName ?? EMPTY_CONTACT_FORM_VALUES.lastName,
      phone: contact?.phone ?? EMPTY_CONTACT_FORM_VALUES.phone,
      email: contact?.email ?? EMPTY_CONTACT_FORM_VALUES.email,
      city: contact?.city ?? EMPTY_CONTACT_FORM_VALUES.city,
      commune: contact?.commune ?? EMPTY_CONTACT_FORM_VALUES.commune,
      quartier: contact?.quartier ?? EMPTY_CONTACT_FORM_VALUES.quartier,
      avenue: contact?.avenue ?? EMPTY_CONTACT_FORM_VALUES.avenue,
      number: contact?.number ?? EMPTY_CONTACT_FORM_VALUES.number,
    }),
    [contact],
  );
  const {
    control,
    getFieldState,
    handleSubmit,
    reset,
    setFocus,
    trigger,
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

  const cityOptions = useMemo(
    () => DRC_CITIES.map((city) => ({ value: city, label: city })),
    [],
  );

  const handleInvalid: SubmitErrorHandler<ContactFormValues> = (formErrors) => {
    const firstInvalidField = FIELD_ORDER.find((field) => formErrors[field] !== undefined);
    if (firstInvalidField !== undefined) {
      setFocus(firstInvalidField);
    }
  };

  const handleValid = (values: ValidContactDetails): void => {
    const existingClient = findClientByPhone(clients, values.phone);
    if (existingClient !== undefined && existingClient.id !== clientId) {
      setDuplicateConfirmation({ client: existingClient, contact: values });
      return;
    }

    onContinue(values);
  };

  const handleNext = async (): Promise<void> => {
    if (step === 1) {
      const isStepValid = await trigger(IDENTITY_FIELDS);
      if (!isStepValid) {
        const firstInvalidField = IDENTITY_FIELDS.find(
          (field) => getFieldState(field).error !== undefined,
        );
        if (firstInvalidField !== undefined) {
          setFocus(firstInvalidField);
        }
        return;
      }

      setStep(2);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }

    await handleSubmit(handleValid, handleInvalid)();
  };

  const errorText = (message: string | undefined): string | undefined => {
    if (message === undefined) {
      return undefined;
    }

    return isContactValidationKey(message) ? t(message) : t('error.unknown');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="contact-screen">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <View className="flex-row items-center px-l" style={{ paddingTop: insets.top + 8 }}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            className="h-11 w-11 items-center justify-center"
            testID="contact-back"
          >
            <Icon icon={ChevronLeft} size={22} color="on-surface" />
          </Pressable>
          <Text
            accessibilityRole="header"
            className="flex-1 text-center text-title-small font-semibold text-on-surface"
          >
            {t('contact.title')}
          </Text>
          <View className="h-11 w-11" />
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="gap-l px-l pb-xl pt-s"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID="contact-scroll"
        >
          <View
            className="h-32 w-32 self-center items-center justify-center rounded-full bg-primary-container"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
              <Icon icon={step === 1 ? UserRound : MapPin} size={38} color="primary" />
            </View>
          </View>

          <View className="items-center gap-s">
            <View
              accessible
              accessibilityLabel={t('onboarding.stepOf', { current: step, total: 2 })}
              className="flex-row gap-xs"
              testID="contact-progress"
            >
              {[1, 2].map((progressStep) => (
                <View
                  key={progressStep}
                  className={`h-2 w-8 rounded-full ${
                    progressStep <= step ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                />
              ))}
            </View>
            <Text className="text-body-medium text-on-surface-variant">
              {t(step === 1 ? 'contact.identityStep' : 'contact.addressStep')}
            </Text>
          </View>

          {step === 1 ? (
            <>
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
                    compact
                    maxLength={60}
                    showCharacterCount={false}
                    errorText={errorText(fieldState.error?.message)}
                    testID="contact-last-name"
                  />
                )}
              />
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
                    compact
                    maxLength={60}
                    showCharacterCount={false}
                    errorText={errorText(fieldState.error?.message)}
                    testID="contact-first-name"
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
                      setDuplicateConfirmation(null);
                      field.onChange(value);
                    }}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    helperText={t('contact.phoneHint')}
                    required
                    compact
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
                    compact
                    errorText={errorText(fieldState.error?.message)}
                    testID="contact-email"
                  />
                )}
              />
            </>
          ) : (
            <>
              <Text accessibilityRole="header" className="text-title-medium text-on-surface">
                {t('contact.fullAddress')}
              </Text>
              <Controller
                control={control}
                name="city"
                render={({ field, fieldState }) => (
                  <Select
                    label={t('contact.city')}
                    value={field.value}
                    options={cityOptions}
                    onChange={field.onChange}
                    leadingIcon={MapPin}
                    placeholder={t('onboarding.selectPlaceholder')}
                    sheetTitle={t('contact.city')}
                    cancelLabel={t('common.cancel')}
                    required
                    compact
                    errorText={errorText(fieldState.error?.message)}
                    testID="contact-city"
                  />
                )}
              />
              {ADDRESS_FIELDS.slice(1).map((fieldName) => {
                const labels: Record<(typeof ADDRESS_FIELDS)[number], TranslationKey> = {
                  city: 'contact.city',
                  commune: 'contact.commune',
                  quartier: 'contact.quartier',
                  avenue: 'contact.avenue',
                  number: 'contact.number',
                };
                const testIds: Record<(typeof ADDRESS_FIELDS)[number], string> = {
                  city: 'contact-city',
                  commune: 'contact-commune',
                  quartier: 'contact-quartier',
                  avenue: 'contact-avenue',
                  number: 'contact-number',
                };
                const capitalizesWords = fieldName !== 'number';

                return (
                  <Controller
                    key={fieldName}
                    control={control}
                    name={fieldName}
                    render={({ field, fieldState }) => (
                      <Input
                        label={t(labels[fieldName])}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        autoCapitalize={capitalizesWords ? 'words' : 'characters'}
                        keyboardType="default"
                        required
                        compact
                        maxLength={fieldName === 'number' ? 20 : 120}
                        showCharacterCount={false}
                        errorText={errorText(fieldState.error?.message)}
                        testID={testIds[fieldName]}
                      />
                    )}
                  />
                );
              })}
            </>
          )}

          <View className="gap-s pt-s">
            <Button
              label={t('common.continue')}
              onPress={() => {
                void handleNext();
              }}
              loading={isSubmitting}
              fullWidth
              testID="contact-continue"
            />
            {step === 2 ? (
              <Button
                label={t('common.back')}
                onPress={() => {
                  setStep(1);
                  scrollRef.current?.scrollTo({ y: 0, animated: false });
                }}
                variant="text"
                fullWidth
                testID="contact-previous"
              />
            ) : null}
          </View>
        </ScrollView>

        <Sheet
          visible={duplicateConfirmation !== null}
          onClose={() => setDuplicateConfirmation(null)}
          title={t('contact.duplicateTitle')}
          accessibilityLabel={t('contact.duplicateTitle')}
          presentation="modal"
          testID="contact-duplicate-sheet"
          footer={
            <View className="gap-s">
              <Button
                label={t('common.continue')}
                onPress={() => {
                  if (duplicateConfirmation !== null) {
                    onContinueExisting(
                      duplicateConfirmation.client,
                      duplicateConfirmation.contact,
                    );
                    setDuplicateConfirmation(null);
                  }
                }}
                fullWidth
                testID="contact-duplicate-continue"
              />
              <Button
                label={t('contact.useAnotherNumber')}
                onPress={() => {
                  setDuplicateConfirmation(null);
                  setStep(1);
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
