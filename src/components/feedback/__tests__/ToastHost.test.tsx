import { fireEvent, render, screen } from '@testing-library/react-native';
import type React from 'react';
import { Pressable, Text } from 'react-native';

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
  it('shows a toast through the context', async () => {
    await render(
      <ToastHost>
        <Trigger message="Child added." testID="trigger" />
      </ToastHost>,
    );

    await fireEvent.press(screen.getByTestId('trigger'));

    expect(screen.getByText('Child added.')).toBeTruthy();
  });

  it('keeps the queue bounded', async () => {
    await render(
      <ToastHost maxToasts={2}>
        <Trigger message="First" testID="trigger-a" />
        <Trigger message="Second" testID="trigger-b" />
        <Trigger message="Third" testID="trigger-c" />
      </ToastHost>,
    );

    await fireEvent.press(screen.getByTestId('trigger-a'));
    await fireEvent.press(screen.getByTestId('trigger-b'));
    await fireEvent.press(screen.getByTestId('trigger-c'));

    expect(screen.queryByText('First')).toBeNull();
    expect(screen.getByText('Second')).toBeTruthy();
    expect(screen.getByText('Third')).toBeTruthy();
  });

  it('dismisses every toast on request', async () => {
    await render(
      <ToastHost>
        <Trigger message="Only one" testID="trigger" />
      </ToastHost>,
    );

    await fireEvent.press(screen.getByTestId('trigger'));
    expect(screen.getByText('Only one')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('trigger-clear'));

    expect(screen.queryByText('Only one')).toBeNull();
  });

  it('runs the action of a toast', async () => {
    const onAction = jest.fn();

    await render(
      <ToastHost>
        <Trigger message="With action" testID="trigger" onAction={onAction} />
      </ToastHost>,
    );

    await fireEvent.press(screen.getByTestId('trigger'));
    await fireEvent.press(screen.getByText('Undo'));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
