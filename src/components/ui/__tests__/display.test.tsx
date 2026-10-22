import { fireEvent, render } from '@testing-library/react-native';
import { Home, User } from 'lucide-react-native';
import { Text } from 'react-native';

import {
  Alert,
  Avatar,
  Badge,
  Card,
  Divider,
  Icon,
  KeyValue,
  ListItem,
  Surface,
  Timeline,
} from '@/components/ui';

describe('Icon', () => {
  it('renders a decorative icon without an accessible name', async () => {
    const { getByTestId } = await render(<Icon icon={Home} testID="icon" />);

    expect(getByTestId('icon', { includeHiddenElements: true })).toBeTruthy();
  });

  it('renders a labelled icon', async () => {
    const { getByLabelText } = await render(<Icon icon={Home} label="Home" />);

    expect(getByLabelText('Home')).toBeTruthy();
  });
});

describe('Card', () => {
  it('renders the title and subtitle', async () => {
    const { getByText } = await render(<Card title="Request" subtitle="Draft" />);

    expect(getByText('Request')).toBeTruthy();
    expect(getByText('Draft')).toBeTruthy();
  });

  it('calls onPress when it is pressable', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Card title="Request" onPress={onPress} />);

    await fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Surface', () => {
  it('renders its children', async () => {
    const { getByText } = await render(
      <Surface>
        <Text>Content</Text>
      </Surface>,
    );

    expect(getByText('Content')).toBeTruthy();
  });
});

describe('ListItem', () => {
  it('renders the title and calls onPress', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <ListItem title="Mathematics" subtitle="Secondary" leadingIcon={Home} onPress={onPress} />,
    );

    expect(getByText('Mathematics')).toBeTruthy();
    expect(getByText('Secondary')).toBeTruthy();

    await fireEvent.press(getByText('Mathematics'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Badge', () => {
  it('renders the label', async () => {
    const { getByText } = await render(<Badge label="Paid" variant="success" />);

    expect(getByText('Paid')).toBeTruthy();
  });
});

describe('Avatar', () => {
  it('derives the initials from the name', async () => {
    const { getByText } = await render(<Avatar name="Marie Kabila" />);

    expect(getByText('MK')).toBeTruthy();
  });
});

describe('Divider', () => {
  it('renders', async () => {
    const { getByTestId } = await render(<Divider testID="divider" />);

    expect(getByTestId('divider')).toBeTruthy();
  });
});

describe('KeyValue', () => {
  it('renders the label and the value', async () => {
    const { getByText } = await render(<KeyValue label="Status" value="Under review" />);

    expect(getByText('Status')).toBeTruthy();
    expect(getByText('Under review')).toBeTruthy();
  });
});

describe('Alert', () => {
  it('renders the message', async () => {
    const { getByText } = await render(
      <Alert variant="warning" title="Payment pending" message="The receipt is not available yet." />,
    );

    expect(getByText('Payment pending')).toBeTruthy();
    expect(getByText('The receipt is not available yet.')).toBeTruthy();
  });

  it('exposes the alert role for errors', async () => {
    const { getByRole } = await render(<Alert variant="error" message="Something went wrong" />);

    expect(getByRole('alert')).toBeTruthy();
  });

  it('calls onDismiss', async () => {
    const onDismiss = jest.fn();
    const { getByText } = await render(
      <Alert variant="info" message="Information" dismissLabel="Close" onDismiss={onDismiss} />,
    );

    await fireEvent.press(getByText('Close'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('Timeline', () => {
  it('renders every entry', async () => {
    const { getByText } = await render(
      <Timeline
        entries={[
          { id: '1', title: 'Request submitted', status: 'done', dateLabel: '12 May' },
          { id: '2', title: 'Proposal sent', status: 'current' },
        ]}
      />,
    );

    expect(getByText('Request submitted')).toBeTruthy();
    expect(getByText('Proposal sent')).toBeTruthy();
    expect(getByText('12 May')).toBeTruthy();
  });
});

describe('icon driven components', () => {
  it('renders a list item with a trailing icon', async () => {
    const { getByText } = await render(<ListItem title="Profile" trailingIcon={User} />);

    expect(getByText('Profile')).toBeTruthy();
  });
});
