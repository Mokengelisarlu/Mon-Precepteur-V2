import { fireEvent, render } from '@testing-library/react-native';
import { Home, User } from 'lucide-react-native';

import {
  Button,
  Checkbox,
  IconButton,
  Input,
  MultiSelect,
  PinInput,
  Select,
  TextArea,
} from '@/components/ui';

describe('Button', () => {
  it('calls onPress', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Button label="Continue" onPress={onPress} />);

    await fireEvent.press(getByText('Continue'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Button label="Continue" onPress={onPress} disabled />);

    await fireEvent.press(getByText('Continue'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress while loading', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Button label="Continue" onPress={onPress} loading />);

    await fireEvent.press(getByText('Continue'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes the disabled and busy accessibility state', async () => {
    const { getByRole } = await render(<Button label="Continue" onPress={jest.fn()} loading />);

    expect(getByRole('button').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
  });
});

describe('IconButton', () => {
  it('requires an accessible name', async () => {
    const { getByRole } = await render(
      <IconButton icon={Home} onPress={jest.fn()} accessibilityLabel="Home" />,
    );

    expect(getByRole('button').props.accessibilityLabel).toBe('Home');
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <IconButton icon={Home} onPress={onPress} accessibilityLabel="Home" disabled />,
    );

    await fireEvent.press(getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Input', () => {
  it('reports text changes', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <Input value="" onChangeText={onChangeText} testID="phone" />,
    );

    await fireEvent.changeText(getByTestId('phone'), '+243 81 000 0000');

    expect(onChangeText).toHaveBeenCalledWith('+243 81 000 0000');
  });

  it('shows the error message instead of the helper text', async () => {
    const { getByText, queryByText } = await render(
      <Input
        label="Phone"
        value=""
        onChangeText={jest.fn()}
        helperText="Digits only"
        errorText="Invalid number"
      />,
    );

    expect(getByText('Invalid number')).toBeTruthy();
    expect(queryByText('Digits only')).toBeNull();
  });

  it('marks the label as required', async () => {
    const { getByText } = await render(
      <Input label="Phone" value="" onChangeText={jest.fn()} required />,
    );

    expect(getByText('*')).toBeTruthy();
  });
});

describe('TextArea', () => {
  it('reports text changes', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TextArea label="Needs" value="" onChangeText={onChangeText} testID="needs" />,
    );

    await fireEvent.changeText(getByTestId('needs'), 'Help with homework');

    expect(onChangeText).toHaveBeenCalledWith('Help with homework');
  });
});

describe('Select', () => {
  const options = [
    { value: 'maths', label: 'Mathematics' },
    { value: 'french', label: 'French' },
  ];

  it('opens the sheet and reports the chosen option', async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText } = await render(
      <Select
        label="Subject"
        value={undefined}
        options={options}
        onChange={onChange}
        placeholder="Choose a subject"
        cancelLabel="Cancel"
        testID="subject"
      />,
    );

    await fireEvent.press(getByTestId('subject'));
    await fireEvent.press(getByText('Mathematics'));

    expect(onChange).toHaveBeenCalledWith('maths');
  });

  it('keeps the sheet closed until the trigger is pressed', async () => {
    const { queryByText } = await render(
      <Select
        label="Subject"
        value={undefined}
        options={options}
        onChange={jest.fn()}
        cancelLabel="Cancel"
        testID="subject"
      />,
    );

    expect(queryByText('Mathematics')).toBeNull();
  });
});

describe('MultiSelect', () => {
  const options = [
    { value: 'maths', label: 'Mathematics' },
    { value: 'french', label: 'French' },
  ];

  it('applies the draft selection on confirm', async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText } = await render(
      <MultiSelect
        label="Subjects"
        values={[]}
        options={options}
        onChange={onChange}
        cancelLabel="Cancel"
        confirmLabel="Confirm"
        testID="subjects"
      />,
    );

    await fireEvent.press(getByTestId('subjects'));
    await fireEvent.press(getByText('Mathematics'));
    await fireEvent.press(getByText('Confirm'));

    expect(onChange).toHaveBeenCalledWith(['maths']);
  });
});

describe('PinInput', () => {
  it('keeps digits only and caps the length', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <PinInput length={6} value="" onChange={onChange} testID="pin" />,
    );

    await fireEvent.changeText(getByTestId('pin'), '12a3456789');

    expect(onChange).toHaveBeenCalledWith('123456');
  });

  it('reports completion when every digit is filled', async () => {
    const onComplete = jest.fn();
    const { getByTestId } = await render(
      <PinInput length={6} value="" onChange={jest.fn()} onComplete={onComplete} testID="pin" />,
    );

    await fireEvent.changeText(getByTestId('pin'), '123456');

    expect(onComplete).toHaveBeenCalledWith('123456');
  });
});

describe('Checkbox', () => {
  it('toggles', async () => {
    const onToggle = jest.fn();
    const { getByRole } = await render(
      <Checkbox checked={false} onToggle={onToggle} label="Same tutor" />,
    );

    await fireEvent.press(getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('exposes the checked state', async () => {
    const { getByRole } = await render(
      <Checkbox checked onToggle={jest.fn()} label="Same tutor" />,
    );

    expect(getByRole('checkbox').props.accessibilityState).toMatchObject({ checked: true });
  });
});

describe('icon usage', () => {
  it('accepts any lucide glyph', async () => {
    const { getByTestId } = await render(<IconButton icon={User} onPress={jest.fn()} accessibilityLabel="Profile" testID="profile" />);

    expect(getByTestId('profile')).toBeTruthy();
  });
});
