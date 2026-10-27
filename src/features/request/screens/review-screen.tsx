import type React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, ErrorState, KeyValue, Stepper } from '@/components/ui';
import {
  ageFromBirthYear,
  choiceLabel,
  DAY_OPTIONS,
  ESTIMATED_LEVEL_OPTIONS,
  FREQUENCY_OPTIONS,
  GOAL_OPTIONS,
  GRADE_OPTIONS,
  SLOT_OPTIONS,
  SUBJECT_OPTIONS,
} from '@/features/children';
import type { ChildDraftRecord, ChildOnboardingData } from '@/features/children';
import type { ClientContactDetails } from '@/features/client';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/i18n/types';

import { NEED_FORMAT_LABEL_KEYS, NEED_FREQUENCY_LABEL_KEYS, TUTOR_PREFERENCE_LABEL_KEYS } from '../lib/need-labels';
import type {
  AdultLearningNeedDraft,
  JourneyType,
  TutorPreference,
} from '../types';

export interface ReviewScreenProps {
  readonly journeyType: JourneyType;
  readonly childDrafts: readonly ChildDraftRecord[];
  readonly onboardingByChildId: Readonly<Record<string, ChildOnboardingData>>;
  readonly selfNeeds: readonly AdultLearningNeedDraft[];
  readonly contact: ClientContactDetails;
  readonly tutorPreference: TutorPreference;
  readonly errorMessage: TranslationKey | null;
  readonly isSubmitting: boolean;
  readonly onEditChild: () => void;
  readonly onEditSelfNeeds: () => void;
  readonly onEditLearner: () => void;
  readonly onEditContact: () => void;
  readonly onEditTutorPreference: () => void;
  readonly onSubmit: () => void;
}

interface EditActionProps {
  readonly label: string;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
}

function EditAction({ label, accessibilityLabel, onPress }: EditActionProps): React.JSX.Element {
  return (
    <Button
      label={label}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      variant="text"
      className="self-start"
    />
  );
}

interface NeedSummaryProps {
  readonly need: AdultLearningNeedDraft;
}

function NeedSummary({ need }: NeedSummaryProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View className="gap-xs border-t border-outline-variant pt-s" testID={`review-need-${need.id}`}>
      <Text accessibilityRole="header" className="text-title-small text-on-surface">
        {need.subject}
      </Text>
      <Badge label={t(NEED_FORMAT_LABEL_KEYS[need.format])} />
      <KeyValue label={t('need.level')} value={need.level} />
      <KeyValue label={t('need.objective')} value={need.objective} />
      <KeyValue
        label={t('need.frequency')}
        value={t(NEED_FREQUENCY_LABEL_KEYS[need.frequency])}
      />
      <KeyValue
        label={t('need.sessionMinutes')}
        value={t('need.sessionMinutesSummary', { minutes: need.sessionMinutes })}
      />
      <KeyValue label={t('need.availability')} value={need.availability} />
      {need.location === undefined ? null : (
        <KeyValue label={t('need.location')} value={need.location} />
      )}
      {need.notes === undefined ? null : <KeyValue label={t('need.notes')} value={need.notes} />}
    </View>
  );
}

function ChildSummary({
  child,
  learningContext,
}: {
  readonly child: ChildDraftRecord;
  readonly learningContext: ChildOnboardingData | undefined;
}): React.JSX.Element {
  const { t, locale } = useTranslation();
  const translatedList = (
    values: readonly string[],
    choices: Parameters<typeof choiceLabel>[0],
  ): string => values.map((value) => choiceLabel(choices, value, t)).join(', ');

  return (
    <View className="gap-xs" testID={`review-child-${child.id}`}>
      <Text accessibilityRole="header" className="text-title-small text-on-surface">
        {[child.firstName, child.lastName].filter(Boolean).join(' ')}
      </Text>
      <KeyValue label={t('child.firstName')} value={child.firstName} />
      {child.lastName === undefined ? null : (
        <KeyValue label={t('child.lastName')} value={child.lastName} />
      )}
      <KeyValue label={t('child.yearOfBirth')} value={String(child.yearOfBirth)} />
      <Text className="text-body-small text-on-surface-variant">
        {t('children.ageSummary', { age: ageFromBirthYear(child.yearOfBirth) })}
      </Text>
      <KeyValue label={t('child.level')} value={child.level} />
      {child.school === undefined ? null : (
        <KeyValue label={t('child.school')} value={child.school} />
      )}
      {child.notes === undefined ? null : <KeyValue label={t('child.notes')} value={child.notes} />}
      {learningContext === undefined ? null : (
        <View className="gap-xs border-t border-outline-variant pt-s">
          <Text accessibilityRole="header" className="text-title-small text-on-surface">
            {t('review.learningContext')}
          </Text>
          <KeyValue
            label={t('onboarding.grade')}
            value={choiceLabel(GRADE_OPTIONS, learningContext.grade, t)}
          />
          <KeyValue
            label={t('onboarding.estimatedLevel')}
            value={choiceLabel(ESTIMATED_LEVEL_OPTIONS, learningContext.estimatedLevel, t)}
          />
          <KeyValue
            label={t('onboarding.subjects')}
            value={[
              ...learningContext.subjects.map((subject) =>
                choiceLabel(SUBJECT_OPTIONS, subject, t),
              ),
              learningContext.otherSubject,
            ]
              .filter(Boolean)
              .join(', ')}
          />
          {learningContext.goals.length === 0 ? null : (
            <KeyValue
              label={t('onboarding.goals')}
              value={translatedList(learningContext.goals, GOAL_OPTIONS)}
            />
          )}
          {learningContext.startDate.length === 0 ? null : (
            <KeyValue
              label={t('onboarding.startDate')}
              value={formatDate(learningContext.startDate, locale)}
            />
          )}
          <KeyValue
            label={t('onboarding.frequency')}
            value={choiceLabel(FREQUENCY_OPTIONS, learningContext.frequency, t)}
          />
          <KeyValue
            label={t('onboarding.days')}
            value={translatedList(learningContext.days, DAY_OPTIONS)}
          />
          <KeyValue
            label={t('onboarding.slots')}
            value={translatedList(learningContext.slots, SLOT_OPTIONS)}
          />
          {learningContext.notes.trim().length === 0 ? null : (
            <KeyValue label={t('onboarding.notes')} value={learningContext.notes} />
          )}
        </View>
      )}
    </View>
  );
}

export function ReviewScreen({
  journeyType,
  childDrafts,
  onboardingByChildId,
  selfNeeds,
  contact,
  tutorPreference,
  errorMessage,
  isSubmitting,
  onEditChild,
  onEditSelfNeeds,
  onEditLearner,
  onEditContact,
  onEditTutorPreference,
  onSubmit,
}: ReviewScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const steps =
    journeyType === 'child'
      ? [
          t('nav.childForm'),
          t('children.stepContact'),
          t('nav.pin'),
          t('children.stepReview'),
        ]
      : [
          t('children.stepNeeds'),
          t('children.stepContact'),
          t('nav.pin'),
          t('children.stepReview'),
        ];
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="review-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-l px-l pb-xl pt-l"
        showsVerticalScrollIndicator={false}
        testID="review-scroll"
      >
        <Stepper steps={steps} currentIndex={steps.length - 1} testID="review-stepper" />
        <Text accessibilityRole="header" className="text-headline-small text-on-surface">
          {t('review.title')}
        </Text>

        <Card testID="review-people-section">
          <View className="gap-s">
            <Text accessibilityRole="header" className="text-title-medium text-on-surface">
              {t(journeyType === 'child' ? 'review.child' : 'review.learner')}
            </Text>
            <Badge label={t(journeyType === 'child' ? 'requestType.child' : 'requestType.self')} />
            {journeyType === 'child' ? (
              <>
                {childDrafts.map((child) => (
                  <ChildSummary
                    key={child.id}
                    child={child}
                    learningContext={onboardingByChildId[child.id]}
                  />
                ))}
                <EditAction
                  label={t('review.edit')}
                  accessibilityLabel={t('review.editChild')}
                  onPress={onEditChild}
                />
              </>
            ) : (
              <>
                <KeyValue label={t('contact.firstName')} value={contact.firstName} />
                <KeyValue label={t('contact.lastName')} value={contact.lastName} />
                <EditAction
                  label={t('review.edit')}
                  accessibilityLabel={t('review.editLearner')}
                  onPress={onEditLearner}
                />
              </>
            )}
          </View>
        </Card>

        {journeyType === 'self' ? (
        <Card testID="review-needs-section">
          <View className="gap-s">
            <Text accessibilityRole="header" className="text-title-medium text-on-surface">
              {t('review.needs')}
            </Text>
            {selfNeeds.map((need) => <NeedSummary key={need.id} need={need} />)}
            <EditAction
              label={t('review.edit')}
              accessibilityLabel={t('review.editNeeds')}
              onPress={onEditSelfNeeds}
            />
          </View>
        </Card>
        ) : null}

        <Card testID="review-contact-section">
          <View className="gap-s">
            <Text accessibilityRole="header" className="text-title-medium text-on-surface">
              {t('review.contact')}
            </Text>
            <KeyValue label={t('contact.firstName')} value={contact.firstName} />
            <KeyValue label={t('contact.lastName')} value={contact.lastName} />
            <KeyValue label={t('contact.phone')} value={contact.phone} />
            {contact.email === undefined ? null : (
              <KeyValue label={t('contact.emailOptional')} value={contact.email} />
            )}
            {contact.address === undefined ? null : (
              <KeyValue label={t('contact.fullAddress')} value={contact.address} />
            )}
            <EditAction
              label={t('review.edit')}
              accessibilityLabel={t('review.editContact')}
              onPress={onEditContact}
            />
          </View>
        </Card>

        {journeyType === 'self' ? (
        <Card testID="review-tutor-preference-section">
          <View className="gap-s">
            <Text accessibilityRole="header" className="text-title-medium text-on-surface">
              {t('review.tutorPreference')}
            </Text>
            <Text className="text-body-medium text-on-surface">
              {t(TUTOR_PREFERENCE_LABEL_KEYS[tutorPreference])}
            </Text>
            <Text className="text-body-small text-on-surface-variant">
              {t('need.tutorPreferenceNote')}
            </Text>
            <EditAction
              label={t('review.edit')}
              accessibilityLabel={t('review.editTutorPreference')}
              onPress={onEditTutorPreference}
            />
          </View>
        </Card>
        ) : null}

        {errorMessage === null ? null : (
          <ErrorState
            title={t('review.errorTitle')}
            description={t(errorMessage)}
            retryLabel={t('common.retry')}
            onRetry={onSubmit}
            testID="review-submit-error"
          />
        )}
      </ScrollView>
      <View className="border-t border-outline-variant bg-surface px-l pb-l pt-s">
        <Button
          label={t('review.submit')}
          onPress={onSubmit}
          loading={isSubmitting}
          fullWidth
          testID="review-submit"
        />
      </View>
    </SafeAreaView>
  );
}
