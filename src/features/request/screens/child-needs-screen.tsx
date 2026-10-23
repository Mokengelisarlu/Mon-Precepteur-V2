import { BookOpen, Plus } from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Dialog, EmptyState, Stepper } from '@/components/ui';
import { useToast } from '@/components/feedback';
import { useTranslation } from '@/hooks/use-translation';
import type { ChildDraftRecord } from '@/features/children/types';

import { NeedForm } from '../components/need-form';
import { NeedListItem } from '../components/need-list-item';
import { TutorPreferenceControl } from '../components/tutor-preference';
import type {
  ChildLearningNeedDraft,
  LearningNeedDraft,
  TutorPreference,
} from '../types';

export interface ChildNeedsScreenProps {
  readonly child: ChildDraftRecord;
  readonly needs: readonly ChildLearningNeedDraft[];
  readonly tutorPreference: TutorPreference;
  readonly onSaveNeed: (need: LearningNeedDraft) => void;
  readonly onRemoveNeed: (needId: string) => void;
  readonly onTutorPreferenceChange: (preference: TutorPreference) => void;
  readonly onBack: () => void;
  readonly onContinue: () => void;
}

export function ChildNeedsScreen({
  child,
  needs,
  tutorPreference,
  onSaveNeed,
  onRemoveNeed,
  onTutorPreferenceChange,
  onBack,
  onContinue,
}: ChildNeedsScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [needToEdit, setNeedToEdit] = useState<ChildLearningNeedDraft | null>(null);
  const [isAddingNeed, setIsAddingNeed] = useState(false);
  const [needToRemove, setNeedToRemove] = useState<ChildLearningNeedDraft | null>(null);
  const steps = [
    t('nav.children'),
    t('children.stepNeeds'),
    t('children.stepContact'),
    t('children.stepReview'),
  ];
  const childName = [child.firstName, child.lastName].filter(Boolean).join(' ');

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
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="child-needs-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-l px-l pb-xl pt-l"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID="child-needs-scroll"
      >
        <Button
          label={t('common.back')}
          onPress={onBack}
          variant="text"
          className="self-start"
          testID="child-needs-back"
        />
        <Stepper steps={steps} currentIndex={1} testID="child-needs-stepper" />
        <View className="gap-xs">
          <Text accessibilityRole="header" className="text-headline-small text-on-surface">
            {t('need.title', { name: childName })}
          </Text>
        </View>
        {needs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t('need.emptyTitle')}
            description={t('need.emptyDescription')}
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
          testID="child-needs-continue"
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
          owner={{ type: 'child', childId: child.id }}
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
