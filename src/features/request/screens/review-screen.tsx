import type React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, ErrorState, KeyValue, Stepper } from '@/components/ui';
import { ageFromBirthYear } from '@/features/children';
import type { ChildDraftRecord } from '@/features/children';
import type { ClientContactDetails } from '@/features/client';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/i18n/types';

import { NEED_FORMAT_LABEL_KEYS, NEED_FREQUENCY_LABEL_KEYS, TUTOR_PREFERENCE_LABEL_KEYS } from '../lib/need-labels';
import type {
  AdultLearningNeedDraft,
  ChildLearningNeedDraft,
  JourneyType,
  TutorPreference,
} from '../types';

export interface ReviewScreenProps {
  readonly journeyType: JourneyType;
  readonly childDrafts: readonly ChildDraftRecord[];
  readonly needsByChildId: Readonly<Record<string, readonly ChildLearningNeedDraft[]>>;
  readonly selfNeeds: readonly AdultLearningNeedDraft[];
  readonly contact: ClientContactDetails;
  readonly tutorPreference: TutorPreference;
  readonly errorMessage: TranslationKey | null;
  readonly isSubmitting: boolean;
  readonly onEditChildren: () => void;
  readonly onEditNeedsForChild: (childId: string) => void;
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
  readonly need: ChildLearningNeedDraft | AdultLearningNeedDraft;
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

function ChildSummary({ child }: { readonly child: ChildDraftRecord }): React.JSX.Element {
  const { t } = useTranslation();

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
    </View>
  );
}

export function ReviewScreen({
  journeyType,
  childDrafts,
  needsByChildId,
  selfNeeds,
  contact,
  tutorPreference,
  errorMessage,
  isSubmitting,
  onEditChildren,
  onEditNeedsForChild,
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
          t('nav.children'),
          t('children.stepNeeds'),
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
              {t(journeyType === 'child' ? 'review.children' : 'review.learner')}
            </Text>
            <Badge label={t(journeyType === 'child' ? 'requestType.child' : 'requestType.self')} />
            {journeyType === 'child' ? (
              <>
                {childDrafts.map((child) => (
                  <ChildSummary key={child.id} child={child} />
                ))}
                <EditAction
                  label={t('review.edit')}
                  accessibilityLabel={t('review.editChildren')}
                  onPress={onEditChildren}
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

        <Card testID="review-needs-section">
          <View className="gap-s">
            <Text accessibilityRole="header" className="text-title-medium text-on-surface">
              {t('review.needs')}
            </Text>
            {journeyType === 'child'
              ? childDrafts.map((child) => (
                  <View key={child.id} className="gap-s">
                    <Text accessibilityRole="header" className="text-title-small text-on-surface">
                      {child.firstName}
                    </Text>
                    {(needsByChildId[child.id] ?? []).map((need) => (
                      <NeedSummary key={need.id} need={need} />
                    ))}
                    <EditAction
                      label={t('review.edit')}
                      accessibilityLabel={t('review.editNeedsFor', { name: child.firstName })}
                      onPress={() => onEditNeedsForChild(child.id)}
                    />
                  </View>
                ))
              : (
                  <>
                    {selfNeeds.map((need) => <NeedSummary key={need.id} need={need} />)}
                    <EditAction
                      label={t('review.edit')}
                      accessibilityLabel={t('review.editNeeds')}
                      onPress={onEditSelfNeeds}
                    />
                  </>
                )}
          </View>
        </Card>

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
              <KeyValue label={t('contact.addressOptional')} value={contact.address} />
            )}
            <EditAction
              label={t('review.edit')}
              accessibilityLabel={t('review.editContact')}
              onPress={onEditContact}
            />
          </View>
        </Card>

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
