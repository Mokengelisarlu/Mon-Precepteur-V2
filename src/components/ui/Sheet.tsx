import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type React from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radii, themeColor } from '@/lib/theme';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  snapPoints?: readonly (string | number)[];
  accessibilityLabel?: string;
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
});

export function Sheet({
  visible,
  onClose,
  title,
  children,
  footer,
  snapPoints,
  accessibilityLabel,
  className,
  testID,
}: SheetProps): React.JSX.Element {
  const points = useMemo<(string | number)[]>(
    () => (snapPoints === undefined ? ['70%'] : [...snapPoints]),
    [snapPoints],
  );

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
    >
      <BottomSheetView>
        <View className={['px-l pb-xxl', className ?? ''].join(' ')} testID={testID}>
          {title !== undefined ? (
            <Text className="pb-l pt-s text-title-medium text-on-surface">{title}</Text>
          ) : null}
          {children}
        </View>
      </BottomSheetView>
      {footer !== undefined ? <View className="px-l pb-xxl">{footer}</View> : null}
    </BottomSheet>
  );
}
