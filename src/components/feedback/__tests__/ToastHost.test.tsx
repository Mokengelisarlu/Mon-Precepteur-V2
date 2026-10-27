import { fireEvent, render, screen } from '@testing-library/react-native';
import type React from 'react';
import { Pressable, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost, useToast } from '@/components/feedback';

interface TriggerProps {
  message: string;
  testID: string;
  onAction?: () => void;
}

function Trigger({ message, testID, onAction }: TriggerProps): React.JSX.Element {
  const { showToast, dismissAll } = useToast();

  return (
    <>
      <Pressable
        testID={testID}
        onPress={() => {
          showToast({ message, actionLabel: 'Undo', onAction });
        }}
      >
        <Text>Show</Text>
      </Pressable>
      <Pressable testID={`${testID}-clear`} onPress={dismissAll}>
        <Text>Clear</Text>
      </Pressable>
    </>
  );
}

describe('ToastHost', () => {
  function renderHost(children: React.ReactNode, maxToasts?: number) {
    return render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 24, right: 0, bottom: 0, left: 0 },
        }}
      >
        <ToastHost maxToasts={maxToasts}>{children}</ToastHost>
      </SafeAreaProvider>,
    );
  }

  it('shows a toast through the context', async () => {
    await renderHost(<Trigger message="Child added." testID="trigger" />);

    await fireEvent.press(screen.getByTestId('trigger'));

    expect(screen.getByText('Child added.')).toBeTruthy();
    expect(screen.getByTestId('toast-host-container').props.style).toEqual({
      top: 0,
      paddingTop: 40,
    });
  });

  it('keeps the queue bounded', async () => {
    await renderHost(
      <>
        <Trigger message="First" testID="trigger-a" />
        <Trigger message="Second" testID="trigger-b" />
        <Trigger message="Third" testID="trigger-c" />
      </>,
      2,
    );

    await fireEvent.press(screen.getByTestId('trigger-a'));
    await fireEvent.press(screen.getByTestId('trigger-b'));
    await fireEvent.press(screen.getByTestId('trigger-c'));

    expect(screen.queryByText('First')).toBeNull();
    expect(screen.getByText('Second')).toBeTruthy();
    expect(screen.getByText('Third')).toBeTruthy();
  });

  it('dismisses every toast on request', async () => {
    await renderHost(<Trigger message="Only one" testID="trigger" />);

    await fireEvent.press(screen.getByTestId('trigger'));
    expect(screen.getByText('Only one')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('trigger-clear'));

    expect(screen.queryByText('Only one')).toBeNull();
  });

  it('runs the action of a toast', async () => {
    const onAction = jest.fn();

    await renderHost(<Trigger message="With action" testID="trigger" onAction={onAction} />);

    await fireEvent.press(screen.getByTestId('trigger'));
    await fireEvent.press(screen.getByText('Undo'));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
