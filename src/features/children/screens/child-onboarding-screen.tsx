import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  GraduationCap,
  Info,
  Plus,
  School,
  TrendingUp,
  User,
  Users,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Button, Icon, Input, Select, TextArea } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import { formatDate } from '@/lib/format';
import type { TranslationKey } from '@/lib/i18n/types';
import { themeColor } from '@/lib/theme';

import {
  buildBirthYears,
  buildStartDates,
  DAY_OPTIONS,
  ESTIMATED_LEVEL_OPTIONS,
  FREQUENCY_OPTIONS,
  SESSIONS_PER_WEEK,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  GRADE_OPTIONS,
  SLOT_OPTIONS,
  SUBJECT_OPTIONS,
  TOTAL_ONBOARDING_STEPS,
} from '../onboarding-options';
import { createEmptyChildOnboardingData, type ChildOnboardingData } from '../types';
import { isValidYearOfBirth } from '../validation';


const STEP_ICONS: readonly LucideIcon[] = [
  User,
  GraduationCap,
  BookOpen,
  Calendar,
];

type Errors = Partial<Record<keyof ChildOnboardingData, string>>;

export interface ChildOnboardingScreenProps {
  readonly onComplete: (data: ChildOnboardingData) => void;
  readonly onExit?: () => void;
  readonly initialData?: Partial<ChildOnboardingData>;
}

function translateChoice(
  choice: { readonly value: string; readonly labelKey: TranslationKey },
  t: (key: TranslationKey) => string,
): { value: string; label: string } {
  return { value: choice.value, label: t(choice.labelKey) };
}

export function ChildOnboardingScreen({
  onComplete,
  onExit,
  initialData,
}: ChildOnboardingScreenProps): React.JSX.Element {
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const birthYears = useMemo(() => buildBirthYears(), []);
  const startDates = useMemo(() => buildStartDates(), []);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [data, setData] = useState<ChildOnboardingData>(() => ({
    ...createEmptyChildOnboardingData(),
    ...initialData,
  }));

  const sessionsPerWeek = SESSIONS_PER_WEEK[data.frequency] ?? 0;

  const genderOptions = useMemo(
    () => GENDER_OPTIONS.map((choice) => translateChoice(choice, t)),
    [t],
  );
  const gradeOptions = useMemo(
    () => GRADE_OPTIONS.map((choice) => translateChoice(choice, t)),
    [t],
  );
  const levelOptions = useMemo(
    () => ESTIMATED_LEVEL_OPTIONS.map((choice) => translateChoice(choice, t)),
    [t],
  );
  const goalOptions = useMemo(
    () => GOAL_OPTIONS.map((choice) => translateChoice(choice, t)),
    [t],
  );
  const frequencyOptions = useMemo(
    () => FREQUENCY_OPTIONS.map((choice) => translateChoice(choice, t)),
    [t],
  );
  const birthYearOptions = useMemo(
    () => birthYears.map((year) => ({ value: year, label: year })),
    [birthYears],
  );
  const startDateOptions = useMemo(
    () => startDates.map((date) => ({ value: date, label: formatDate(date, locale) })),
    [startDates, locale],
  );

  const set = <K extends keyof ChildOnboardingData>(
    key: K,
    value: ChildOnboardingData[K],
  ): void => {
    setData((previous) => {
      return { ...previous, [key]: value };
    });
    setErrors((previous) => (
      previous[key] === undefined ? previous : { ...previous, [key]: undefined }
    ));
  };

  const toggle = (
    key: 'subjects' | 'goals' | 'slots',
    value: string,
  ): void => {
    const current = data[key];
    set(
      key,
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  };

  const toggleDay = (value: string): void => {
    if (data.days.includes(value)) {
      set('days', data.days.filter((entry) => entry !== value));
      return;
    }

    if (sessionsPerWeek > 0 && data.days.length >= sessionsPerWeek) {
      setErrors((previous) => ({
        ...previous,
        days: t('onboarding.daysLimit', { count: sessionsPerWeek }),
      }));
      return;
    }

    set('days', [...data.days, value]);
  };

  const changeFrequency = (value: string): void => {
    const limit = SESSIONS_PER_WEEK[value] ?? 0;
    const removedDays = limit > 0 && data.days.length > limit;

    setData((previous) => ({
      ...previous,
      frequency: value,
      days: limit > 0 ? previous.days.slice(0, limit) : previous.days,
    }));
    setErrors((previous) => ({
      ...previous,
      frequency: undefined,
      days: removedDays
        ? t('onboarding.daysLimit', { count: limit })
        : undefined,
    }));
  };

  const validateStep = (): Errors => {
    const next: Errors = {};
    const required = t('validation.onboarding.required');
    const pickOne = t('validation.onboarding.pickOne');

    if (step === 1) {
      if (data.firstName.trim().length === 0) next.firstName = required;
      if (data.birthYear.trim().length === 0) next.birthYear = required;
      else if (!isValidYearOfBirth(data.birthYear)) next.birthYear = t('validation.child.yearOfBirth');
      if (data.gender.length === 0) next.gender = required;
    }

    if (step === 2) {
      if (data.grade.length === 0) next.grade = required;
      if (data.estimatedLevel.length === 0) next.estimatedLevel = required;
    }

    if (
      step === 3 &&
      data.subjects.length === 0 &&
      data.otherSubject.trim().length === 0
    ) {
      next.subjects = pickOne;
    }

    if (step === 4) {
      if (data.startDate.length === 0) next.startDate = required;
      if (data.frequency.length === 0) next.frequency = required;
      else if (data.days.length === 0) next.days = pickOne;
      else if (
        sessionsPerWeek > 0 &&
        data.days.length !== sessionsPerWeek
      ) {
        next.days = t('validation.onboarding.daysCount', {
          count: sessionsPerWeek,
        });
      }
      if (data.slots.length === 0) next.slots = pickOne;
    }

    return next;
  };

  const goNext = (): void => {
    const nextErrors = validateStep();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    if (step === TOTAL_ONBOARDING_STEPS) {
      setStep(1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      onComplete(data);
      return;
    }

    setStep((current) => current + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const goBack = (): void => {
    setErrors({});
    if (step === 1) {
      onExit?.();
      return;
    }

    setStep((current) => current - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const isLast = step === TOTAL_ONBOARDING_STEPS;

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={['bottom']}
      testID="child-form-screen"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <View
          className="flex-row items-center px-l"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable
            onPress={goBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            className="h-11 w-11 items-center justify-center"
            testID="child-onboarding-back-arrow"
          >
            <Icon icon={ChevronLeft} size={22} color="on-surface" />
          </Pressable>
          <Text
            className="flex-1 text-center text-title-small font-semibold text-on-surface"
            testID="child-onboarding-step"
          >
            {t('onboarding.step.profile')}
          </Text>
          <View className="h-11 w-11" />
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="gap-l px-l pb-xl pt-s"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          testID="child-onboarding-scroll"
        >
          <StepIllustration step={step} />

          <View className="items-center">
            <Progress
              step={step}
              label={t('onboarding.stepOf', {
                current: step,
                total: TOTAL_ONBOARDING_STEPS,
              })}
            />
          </View>

          {step === 1 ? (
            <>
              <Input
                label={t('onboarding.firstName')}
                value={data.firstName}
                onChangeText={(value) => set('firstName', value)}
                leadingIcon={User}
                placeholder={t('onboarding.firstNamePlaceholder')}
                required
                compact
                maxLength={60}
                showCharacterCount={false}
                errorText={errors.firstName}
                testID="child-first-name"
              />
              <Input
                label={`${t('onboarding.lastName')} (${t('common.optional')})`}
                value={data.lastName}
                onChangeText={(value) => set('lastName', value)}
                leadingIcon={User}
                placeholder={t('onboarding.lastNamePlaceholder')}
                compact
                maxLength={60}
                showCharacterCount={false}
                testID="child-last-name"
              />
              <Select
                label={t('onboarding.birthYear')}
                value={data.birthYear}
                options={birthYearOptions}
                onChange={(value) => set('birthYear', value)}
                leadingIcon={Calendar}
                placeholder={t('onboarding.selectPlaceholder')}
                sheetTitle={t('onboarding.birthYear')}
                cancelLabel={t('common.cancel')}
                required
                compact
                errorText={errors.birthYear}
                testID="child-year-of-birth"
              />
              <Select
                label={t('onboarding.gender')}
                value={data.gender}
                options={genderOptions}
                onChange={(value) => set('gender', value)}
                leadingIcon={Users}
                placeholder={t('onboarding.selectPlaceholder')}
                sheetTitle={t('onboarding.gender')}
                cancelLabel={t('common.cancel')}
                required
                compact
                errorText={errors.gender}
                testID="child-gender"
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Select
                label={t('onboarding.grade')}
                value={data.grade}
                options={gradeOptions}
                onChange={(value) => set('grade', value)}
                leadingIcon={GraduationCap}
                placeholder={t('onboarding.selectPlaceholder')}
                sheetTitle={t('onboarding.grade')}
                cancelLabel={t('common.cancel')}
                required
                compact
                errorText={errors.grade}
                testID="child-grade"
              />
              <Input
                label={`${t('onboarding.school')} (${t('common.optional')})`}
                value={data.school}
                onChangeText={(value) => set('school', value)}
                leadingIcon={School}
                placeholder={t('onboarding.schoolPlaceholder')}
                autoCapitalize="words"
                compact
                maxLength={80}
                showCharacterCount={false}
                testID="child-school"
              />
              <Select
                label={t('onboarding.estimatedLevel')}
                value={data.estimatedLevel}
                options={levelOptions}
                onChange={(value) => set('estimatedLevel', value)}
                leadingIcon={TrendingUp}
                placeholder={t('onboarding.selectPlaceholder')}
                sheetTitle={t('onboarding.estimatedLevel')}
                cancelLabel={t('common.cancel')}
                required
                compact
                errorText={errors.estimatedLevel}
                testID="child-estimated-level"
              />
              <View className="flex-row gap-s rounded-card border border-warning-container bg-warning-container p-m">
                <View className="mt-[1px] h-[20px] w-[20px] items-center justify-center rounded-full bg-primary">
                  <Icon icon={Info} size={14} color="on-primary" strokeWidth={2.4} />
                </View>
                <Text className="flex-1 text-body-small text-on-warning-container">
                  {t('onboarding.estimatedLevelInfo')}
                </Text>
              </View>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <FieldGroup label={t('onboarding.subjects')} required error={errors.subjects}>
                <View className="gap-s">
                  <ChipGrid
                    items={SUBJECT_OPTIONS.map((choice) => ({
                      value: choice.value,
                      label: t(choice.labelKey),
                      icon: choice.icon,
                    }))}
                    selected={data.subjects}
                    onToggle={(value) => toggle('subjects', value)}
                    columns={2}
                    testIDPrefix="child-subject"
                  />
                  <Input
                    label={t('onboarding.otherSubject')}
                    value={data.otherSubject}
                    onChangeText={(value) => set('otherSubject', value)}
                    leadingIcon={Plus}
                    placeholder={t('onboarding.otherSubjectPlaceholder')}
                    autoCapitalize="sentences"
                    compact
                    maxLength={60}
                    showCharacterCount={false}
                    testID="child-other-subject"
                  />
                </View>
              </FieldGroup>
              <FieldGroup
                label={t('onboarding.goals')}
                hint={t('onboarding.goalsHint')}
              >
                <View className="gap-s">
                  {goalOptions.map((goal) => (
                    <CheckRow
                      key={goal.value}
                      label={goal.label}
                      checked={data.goals.includes(goal.value)}
                      onPress={() => toggle('goals', goal.value)}
                      testID={`child-goal-${goal.value}`}
                    />
                  ))}
                </View>
              </FieldGroup>
              <TextArea
                label={`${t('onboarding.notes')} (${t('common.optional')})`}
                value={data.notes}
                onChangeText={(value) => set('notes', value)}
                placeholder={t('onboarding.notesPlaceholder')}
                compact
                minHeight={72}
                maxLength={500}
                showCharacterCount={false}
                testID="child-notes"
              />
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Select
                label={t('onboarding.startDate')}
                value={data.startDate}
                options={startDateOptions}
                onChange={(value) => set('startDate', value)}
                leadingIcon={Calendar}
                placeholder={t('onboarding.selectPlaceholder')}
                sheetTitle={t('onboarding.startDate')}
                cancelLabel={t('common.cancel')}
                required
                compact
                errorText={errors.startDate}
                testID="child-start-date"
              />
              <Select
                label={t('onboarding.frequency')}
                value={data.frequency}
                options={frequencyOptions}
                onChange={changeFrequency}
                leadingIcon={Calendar}
                placeholder={t('onboarding.selectPlaceholder')}
                sheetTitle={t('onboarding.frequency')}
                cancelLabel={t('common.cancel')}
                required
                compact
                errorText={errors.frequency}
                testID="child-frequency"
              />
              <FieldGroup
                label={t('onboarding.days')}
                required
                hint={
                  sessionsPerWeek > 0
                    ? t('onboarding.daysHint', { count: sessionsPerWeek })
                    : undefined
                }
                error={errors.days}
              >
                <ChipGrid
                  items={DAY_OPTIONS.map((choice) => ({
                    value: choice.value,
                    label: t(choice.labelKey),
                  }))}
                  selected={data.days}
                  onToggle={toggleDay}
                  columns={4}
                  compact
                  testIDPrefix="child-day"
                />
              </FieldGroup>
              <FieldGroup label={t('onboarding.slots')} required error={errors.slots}>
                <ChipGrid
                  items={SLOT_OPTIONS.map((choice) => ({
                    value: choice.value,
                    label: t(choice.labelKey),
                  }))}
                  selected={data.slots}
                  onToggle={(value) => toggle('slots', value)}
                  columns={3}
                  compact
                  testIDPrefix="child-slot"
                />
              </FieldGroup>
            </>
          ) : null}

          <View className="border-t border-outline-variant pt-l">
            <Button
              label={isLast ? t('onboarding.finish') : t('common.next')}
              onPress={goNext}
              fullWidth
              testID="child-onboarding-next"
            />
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              className="mt-xs min-h-[44px] flex-row items-center justify-center gap-xs"
              testID="child-onboarding-back"
            >
              <Icon icon={ArrowLeft} size={16} color="on-surface" />
              <Text className="text-body-medium text-on-surface">{t('common.back')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Progress({
  step,
  label,
}: {
  readonly step: number;
  readonly label: string;
}): React.JSX.Element {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className="mt-xs flex-row items-center"
    >
      {Array.from({ length: TOTAL_ONBOARDING_STEPS }, (_, index) => {
        const number = index + 1;
        const isCurrent = number === step;
        const isReached = number <= step;

        return (
          <View key={number} className="flex-row items-center">
            <View
              className={[
                'rounded-full',
                isCurrent ? 'h-3 w-3 border-2 border-primary-container' : 'h-2 w-2',
                isReached ? 'bg-primary' : 'bg-outline-variant',
              ].join(' ')}
            />
            {index < TOTAL_ONBOARDING_STEPS - 1 ? (
              <View
                className={[
                  'h-[3px] w-[22px] rounded-full',
                  number < step ? 'bg-primary' : 'bg-outline-variant',
                ].join(' ')}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function StepIllustration({ step }: { readonly step: number }): React.JSX.Element {
  const StepIcon = STEP_ICONS[step - 1] ?? User;

  return (
    <View
      className="h-[132px] items-center justify-end"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg
        width="100%"
        height={104}
        viewBox="0 0 320 104"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0 }}
      >
        <Path
          d="M0 104 L0 62 C24 34 64 30 96 44 C128 6 204 2 236 40 C272 30 306 42 320 70 L320 104 Z"
          fill={themeColor('primary-container')}
        />
      </Svg>
      <View className="mb-s h-[88px] w-[88px] items-center justify-center rounded-full border border-outline-variant bg-surface">
        <Icon icon={StepIcon} size={40} color="brand-orange" strokeWidth={1.6} />
      </View>
    </View>
  );
}

interface FieldGroupProps {
  readonly label: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly error?: string;
  readonly children: React.ReactNode;
}

function FieldGroup({ label, required, hint, error, children }: FieldGroupProps): React.JSX.Element {
  return (
    <View>
      <Text className="mb-xs text-label-large text-on-surface">
        {label}
        {required === true ? <Text className="text-error"> *</Text> : null}
        {hint !== undefined ? (
          <Text className="text-body-small text-on-surface-variant"> {hint}</Text>
        ) : null}
      </Text>
      {children}
      {error !== undefined ? (
        <Text accessibilityRole="alert" className="mt-xs text-body-small text-error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

interface ChipItem {
  readonly value: string;
  readonly label: string;
  readonly icon?: LucideIcon;
}

interface ChipGridProps {
  readonly items: readonly ChipItem[];
  readonly selected: readonly string[];
  readonly onToggle: (value: string) => void;
  readonly columns: number;
  readonly compact?: boolean;
  readonly testIDPrefix: string;
}

function ChipGrid({
  items,
  selected,
  onToggle,
  columns,
  compact = false,
  testIDPrefix,
}: ChipGridProps): React.JSX.Element {
  const { width: windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const gap = compact ? 10 : 12;
  const containerWidth = width > 0 ? width : Math.max(windowWidth - 48, 280);
  const itemWidth = Math.floor((containerWidth - gap * (columns - 1)) / columns);

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      className="flex-row flex-wrap"
      style={{ gap }}
    >
      {items.map(({ value, label, icon }) => {
        const isSelected = selected.includes(value);

        return (
          <Pressable
            key={value}
            onPress={() => onToggle(value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            className={[
              'flex-row items-center justify-center gap-s rounded-card border',
              compact ? 'h-[40px] px-s' : 'h-[44px] px-m',
              isSelected
                ? 'border-primary bg-primary-container'
                : 'border-outline-variant bg-surface',
            ].join(' ')}
            style={{ width: itemWidth }}
            testID={`${testIDPrefix}-${value}`}
          >
            {icon !== undefined ? (
              <Icon
                icon={icon}
                size={17}
                color={isSelected ? 'primary' : 'on-surface-variant'}
                strokeWidth={1.9}
              />
            ) : null}
            <Text
              numberOfLines={1}
              className={[
                compact ? 'text-body-small' : 'text-body-medium',
                isSelected ? 'font-semibold text-on-surface' : 'text-on-surface-variant',
              ].join(' ')}
            >
              {label}
            </Text>
            {isSelected ? (
              <View className="absolute -right-[5px] -top-[5px] h-[18px] w-[18px] items-center justify-center rounded-full bg-primary">
                <Icon icon={Check} size={11} color="on-primary" strokeWidth={3} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

interface CheckRowProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onPress: () => void;
  readonly testID: string;
}

function CheckRow({ label, checked, onPress, testID }: CheckRowProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-center gap-s"
      testID={testID}
    >
      <View
        className={[
          'h-[20px] w-[20px] items-center justify-center rounded-[5px] border-[1.5px]',
          checked ? 'border-primary bg-primary' : 'border-outline bg-surface',
        ].join(' ')}
      >
        {checked ? <Icon icon={Check} size={13} color="on-primary" strokeWidth={3} /> : null}
      </View>
      <Text className="text-body-medium text-on-surface">{label}</Text>
    </Pressable>
  );
}
