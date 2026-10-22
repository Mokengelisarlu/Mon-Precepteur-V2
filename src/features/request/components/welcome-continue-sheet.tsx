import type React from 'react';
import { Text } from 'react-native';

import { Button, Sheet } from '@/components/ui';

export interface WelcomeContinueSheetProps {
  readonly visible: boolean;
  readonly title: string;
  readonly summary: string;
  readonly continueLabel: string;
  readonly cancelLabel: string;
  readonly onClose: () => void;
  readonly onContinue: () => void;
}

export function WelcomeContinueSheet({
  visible,
  title,
  summary,
  continueLabel,
  cancelLabel,
  onClose,
  onContinue,
}: WelcomeContinueSheetProps): React.JSX.Element {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      testID="welcome-continue-sheet"
      footer={
        <Button
          label={continueLabel}
          onPress={onContinue}
          fullWidth
          size="lg"
          testID="welcome-continue-confirm"
        />
      }
    >
      <Text className="pb-l text-body-medium text-on-surface-variant">{summary}</Text>
      <Button
        label={cancelLabel}
        onPress={onClose}
        variant="text"
        fullWidth
        testID="welcome-continue-cancel"
      />
    </Sheet>
  );
}
