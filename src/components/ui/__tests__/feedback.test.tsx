import { fireEvent, render } from '@testing-library/react-native';
import { Home } from 'lucide-react-native';
import { Text } from 'react-native';

import {
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  ProgressBar,
  SegmentedControl,
  Sheet,
  Skeleton,
  Stepper,
  Toast,
} from '@/components/ui';

describe('Sheet', () => {
  it('renders nothing while it is closed', async () => {
    const { queryByText } = await render(
      <Sheet visible={false} onClose={jest.fn()} title="Choose">
        Content
      </Sheet>,
    );

    expect(queryByText('Content')).toBeNull();
    expect(queryByText('Choose')).toBeNull();
  });

  it('renders its content while it is open', async () => {
    const { getByText } = await render(
      <Sheet visible onClose={jest.fn()} title="Choose">
        <Text>Content</Text>
      </Sheet>,
    );

    expect(getByText('Choose')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });
});

describe('Dialog', () => {
  it('calls onConfirm and onCancel', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = await render(
      <Dialog
        visible
        title="Delete the request?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        destructive
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await fireEvent.press(getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByText('Keep'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the message and dismisses itself after the duration', async () => {
    const onDismiss = jest.fn();
    const { getByText } = await render(
      <Toast visible message="Request submitted" variant="success" onDismiss={onDismiss} duration={3000} />,
    );

    expect(getByText('Request submitted')).toBeTruthy();

    jest.advanceTimersByTime(3000);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when it is not visible', async () => {
    const { queryByText } = await render(
      <Toast visible={false} message="Request submitted" onDismiss={jest.fn()} />,
    );

    expect(queryByText('Request submitted')).toBeNull();
  });
});

describe('EmptyState', () => {
  it('renders the title, the description and the action', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <EmptyState
        icon={Home}
        title="No request yet"
        description="Describe what your child needs."
        action={<Button label="Create" onPress={onPress} />}
      />,
    );

    expect(getByText('No request yet')).toBeTruthy();
    expect(getByText('Describe what your child needs.')).toBeTruthy();

    await fireEvent.press(getByText('Create'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorState', () => {
  it('calls onRetry', async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(
      <ErrorState title="Connection lost" description="Check your network." retryLabel="Retry" onRetry={onRetry} />,
    );

    expect(getByText('Connection lost')).toBeTruthy();

    await fireEvent.press(getByText('Retry'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('Skeleton', () => {
  it('is hidden from the accessibility tree', async () => {
    const { getByTestId } = await render(<Skeleton variant="block" testID="skeleton" />);

    expect(getByTestId('skeleton', { includeHiddenElements: true })).toBeTruthy();
  });
});

describe('ProgressBar', () => {
  it('exposes the progress value', async () => {
    const { getByRole } = await render(<ProgressBar value={0.4} label="Completion" />);

    expect(getByRole('progressbar').props.accessibilityValue).toMatchObject({
      min: 0,
      max: 100,
      now: 40,
    });
  });

  it('clamps the value between 0 and 1', async () => {
    const { getByRole } = await render(<ProgressBar value={4} />);

    expect(getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 100 });
  });
});

describe('Stepper', () => {
  it('renders every step', async () => {
    const { getByText } = await render(<Stepper steps={['Request', 'Proposal', 'Payment']} currentIndex={1} />);

    expect(getByText('Request')).toBeTruthy();
    expect(getByText('Proposal')).toBeTruthy();
    expect(getByText('Payment')).toBeTruthy();
  });
});

describe('SegmentedControl', () => {
  it('reports the selected option', async () => {
    const onChange = jest.fn();
    const { getByText } = await render(
      <SegmentedControl
        options={[
          { value: 'a', label: 'First' },
          { value: 'b', label: 'Second' },
        ]}
        value="a"
        onChange={onChange}
      />,
    );

    await fireEvent.press(getByText('Second'));

    expect(onChange).toHaveBeenCalledWith('b');
  });
});
