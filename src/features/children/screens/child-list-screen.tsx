import { UsersRound } from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Dialog, EmptyState, Stepper } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

import { ChildListItem } from '../components/child-list-item';
import type { ChildDraftRecord } from '../types';

export interface ChildListScreenProps {
  readonly childDrafts: readonly ChildDraftRecord[];
  readonly onAdd: () => void;
  readonly onEdit: (childId: string) => void;
  readonly onRemove: (childId: string) => void;
  readonly onContinue: (childId: string) => void;
}

export function ChildListScreen({
  childDrafts,
  onAdd,
  onEdit,
  onRemove,
  onContinue,
}: ChildListScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const [childToRemove, setChildToRemove] = useState<ChildDraftRecord | null>(null);

  const steps = [
    t('nav.children'),
    t('children.stepNeeds'),
    t('children.stepContact'),
    t('children.stepReview'),
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']} testID="child-list-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-l px-l pb-xl pt-l"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        testID="child-list-scroll"
      >
        <Stepper steps={steps} currentIndex={0} testID="children-stepper" />
        <View className="gap-xs">
          <Text accessibilityRole="header" className="text-headline-small text-on-surface">
            {t('children.title')}
          </Text>
          <Text className="text-body-medium text-on-surface-variant">
            {t('children.subtitle')}
          </Text>
        </View>
        {childDrafts.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title={t('children.emptyTitle')}
            description={t('children.emptyDescription')}
            action={
              <Button
                label={t('children.addFirst')}
                onPress={onAdd}
                leadingIcon={UsersRound}
                testID="children-empty-add"
              />
            }
            testID="children-empty-state"
          />
        ) : (
          <View className="gap-s" testID="children-list">
            {childDrafts.map((child) => (
              <ChildListItem
                key={child.id}
                child={child}
                onEdit={() => onEdit(child.id)}
                onRemove={() => setChildToRemove(child)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <View className="border-t border-outline-variant bg-surface px-l pb-l pt-s">
        {childDrafts.length === 0 ? null : (
          <Button
            label={t('children.add')}
            onPress={onAdd}
            variant="tonal"
            fullWidth
            testID="children-add"
          />
        )}
        <Button
          label={t('children.continue')}
          onPress={() => {
            const firstChild = childDrafts[0];
            if (firstChild !== undefined) {
              onContinue(firstChild.id);
            }
          }}
          disabled={childDrafts.length === 0}
          fullWidth
          className="mt-s"
          testID="children-continue"
        />
      </View>
      <Dialog
        visible={childToRemove !== null}
        title={t('children.removeTitle')}
        message={
          childToRemove === null
            ? undefined
            : t('children.removeMessage', {
                name: [childToRemove.firstName, childToRemove.lastName].filter(Boolean).join(' '),
              })
        }
        confirmLabel={t('children.remove')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={() => {
          if (childToRemove !== null) {
            onRemove(childToRemove.id);
            setChildToRemove(null);
          }
        }}
        onCancel={() => setChildToRemove(null)}
        testID="children-remove-dialog"
      />
    </SafeAreaView>
  );
}
