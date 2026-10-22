import type React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  testID?: string;
}

export function Dialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
  children,
  testID,
}: DialogProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        accessible={false}
        onPress={onCancel}
        className="flex-1 items-center justify-center bg-inverse-surface/60 p-xl"
      >
        <Pressable
          accessibilityViewIsModal
          accessibilityRole="alert"
          accessibilityLabel={title}
          onPress={() => undefined}
          className="w-full max-w-[420px] rounded-dialog bg-surface p-xl shadow-elevation-3"
          testID={testID}
        >
          <Text className="text-title-large text-on-surface">{title}</Text>
          {message !== undefined ? (
            <Text className="mt-s text-body-medium text-on-surface-variant">{message}</Text>
          ) : null}
          {children}
          <View className="mt-xl flex-row justify-end gap-s">
            {cancelLabel !== undefined ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}
                onPress={onCancel}
                className="min-h-[44px] justify-center rounded-button px-l"
              >
                <Text className="text-label-large text-primary">{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              className={[
                'min-h-[44px] justify-center rounded-button px-l',
                destructive ? 'bg-error' : 'bg-primary',
              ].join(' ')}
            >
              <Text className={['text-label-large', destructive ? 'text-on-error' : 'text-on-primary'].join(' ')}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
