import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useContext, useMemo } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { radii, themeColor } from '@/lib/theme';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  snapPoints?: readonly (string | number)[];
  presentation?: 'inline' | 'modal';
  accessibilityLabel?: string;
  dismissLabel?: string;
  className?: string;
  testID?: string;
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: themeColor('surface-container'),
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
  },
  handle: {
    backgroundColor: themeColor('outline-variant'),
    width: 32,
    height: 4,
  },
  modalScrollView: {
    flexShrink: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
});

export function Sheet({
  visible,
  onClose,
  title,
  children,
  footer,
  snapPoints,
  presentation = 'inline',
  accessibilityLabel,
  dismissLabel,
  className,
  testID,
}: SheetProps): React.JSX.Element | null {
  const points = useMemo<(string | number)[]>(
    () => (snapPoints === undefined ? ['70%'] : [...snapPoints]),
    [snapPoints],
  );
  const insets = useContext(SafeAreaInsetsContext);

  const sheetContent = (
    <View className={['px-l pb-xxl', className ?? ''].join(' ')} testID={testID}>
      {title !== undefined ? (
        <Text
          accessibilityRole="header"
          className="pb-l pt-s text-title-medium text-on-surface"
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );

  const inlineContent = (
    <>
      <BottomSheetView>{sheetContent}</BottomSheetView>
      {footer !== undefined ? <View className="px-l pb-xxl">{footer}</View> : null}
    </>
  );

  if (presentation === 'modal') {
    if (!visible) {
      return null;
    }

    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole={dismissLabel === undefined ? undefined : 'button'}
            accessibilityLabel={dismissLabel}
            onPress={onClose}
            className="absolute inset-0 bg-inverse-surface/60"
            testID={testID === undefined ? undefined : `${testID}-backdrop`}
          />
          <View
            className="max-h-[88%] w-full"
            style={[styles.background, { paddingBottom: insets?.bottom ?? 0 }]}
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityViewIsModal
          >
            <View className="mb-l mt-s self-center" style={styles.handle} />
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {sheetContent}
            </ScrollView>
            {footer !== undefined ? <View className="px-l pb-xxl">{footer}</View> : null}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      snapPoints={points}
      enableDynamicSizing
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      onClose={onClose}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityViewIsModal
    >
      {inlineContent}
    </BottomSheet>
  );
}
