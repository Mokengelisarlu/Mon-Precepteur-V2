import { BookOpen, Plus } from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Dialog, EmptyState, Stepper } from '@/components/ui';
import { useToast } from '@/components/feedback';
import { useTranslation } from '@/hooks/use-translation';

import { NeedForm } from '../components/need-form';
import { NeedListItem } from '../components/need-list-item';
import { TutorPreferenceControl } from '../components/tutor-preference';
import type {
  AdultLearningNeedDraft,
  LearningNeedDraft,
  TutorPreference,
} from '../types';

export interface AdultNeedsScreenProps {
  readonly needs: readonly AdultLearningNeedDraft[];
  readonly tutorPreference: TutorPreference;
  readonly onSaveNeed: (need: LearningNeedDraft) => void;
  readonly onRemoveNeed: (needId: string) => void;
  readonly onTutorPreferenceChange: (preference: TutorPreference) => void;
  readonly onBack: () => void;
  readonly onContinue: () => void;
}

export function AdultNeedsScreen({
  needs,
  tutorPreference,
  onSaveNeed,
  onRemoveNeed,
  onTutorPreferenceChange,
  onBack,
  onContinue,
}: AdultNeedsScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [needToEdit, setNeedToEdit] = useState<AdultLearningNeedDraft | null>(null);
  const [isAddingNeed, setIsAddingNeed] = useState(false);
  const [needToRemove, setNeedToRemove] = useState<AdultLearningNeedDraft | null>(null);
  const steps = [t('children.stepNeeds'), t('children.stepContact'), t('children.stepReview')];

  const openNewNeed = () => {
    setNeedToEdit(null);
    setIsAddingNeed(true);
  };

  const saveNeed = (need: LearningNeedDraft, isNew: boolean) => {
    onSaveNeed(need);
    setIsAddingNeed(false);
    setNeedToEdit(null);
    showToast({
      message: t(isNew ? 'need.added' : 'need.updated'),
      variant: 'success',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="adult-needs-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-l px-l pb-xl pt-l"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID="adult-needs-scroll"
      >
        <Button
          label={t('common.back')}
          onPress={onBack}
          variant="text"
          className="self-start"
          testID="adult-needs-back"
        />
        <Stepper steps={steps} currentIndex={0} testID="adult-needs-stepper" />
        <Text accessibilityRole="header" className="text-headline-small text-on-surface">
          {t('need.selfTitle')}
        </Text>
        <Text accessibilityRole="header" className="text-title-medium text-on-surface">
          {t('need.selfListTitle')}
        </Text>
        {needs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t('need.emptyTitle')}
            action={
              <Button
                label={t('need.add')}
                onPress={openNewNeed}
                leadingIcon={Plus}
                testID="need-empty-add"
              />
            }
            testID="needs-empty-state"
          />
        ) : (
          <View className="gap-s" testID="needs-list">
            {needs.map((need) => (
              <NeedListItem
                key={need.id}
                need={need}
                onEdit={() => {
                  setNeedToEdit(need);
                  setIsAddingNeed(false);
                }}
                onRemove={() => setNeedToRemove(need)}
              />
            ))}
            <Button
              label={t('need.add')}
              onPress={openNewNeed}
              leadingIcon={Plus}
              variant="tonal"
              fullWidth
              testID="need-add"
            />
          </View>
        )}
        <TutorPreferenceControl
          value={tutorPreference}
          onChange={onTutorPreferenceChange}
        />
      </ScrollView>
      <View className="border-t border-outline-variant bg-surface px-l pb-l pt-s">
        <Button
          label={t('common.continue')}
          onPress={onContinue}
          disabled={needs.length === 0}
          fullWidth
          testID="adult-needs-continue"
        />
      </View>
      <Dialog
        visible={needToRemove !== null}
        title={t('need.removeTitle')}
        message={
          needToRemove === null
            ? undefined
            : t('need.removeMessage', { subject: needToRemove.subject })
        }
        confirmLabel={t('need.remove')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={() => {
          if (needToRemove !== null) {
            onRemoveNeed(needToRemove.id);
            setNeedToRemove(null);
          }
        }}
        onCancel={() => setNeedToRemove(null)}
        testID="need-remove-dialog"
      />
      {isAddingNeed || needToEdit !== null ? (
        <NeedForm
          owner={{ type: 'self' }}
          need={needToEdit ?? undefined}
          onCancel={() => {
            setIsAddingNeed(false);
            setNeedToEdit(null);
          }}
          onSave={saveNeed}
        />
      ) : null}
    </SafeAreaView>
  );
}
