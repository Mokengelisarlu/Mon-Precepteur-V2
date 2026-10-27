import { fireEvent, render, screen } from '@testing-library/react-native';

import { RequestTypeScreen } from '@/features/request/screens/request-type-screen';
import { useSessionStore } from '@/store/session-store';

describe('Request type screen', () => {
  const onClose = jest.fn();
  const onSelect = jest.fn();

  beforeEach(() => {
    useSessionStore.getState().clearLocaleOverride();
    onClose.mockReset();
    onSelect.mockReset();
  });

  it('should render the request options in French by default', async () => {
    await render(<RequestTypeScreen onClose={onClose} onSelect={onSelect} />);

    expect(screen.getByText('Pour qui tu veux un précepteur ?')).toBeTruthy();
    expect(screen.getByText('Pour mon enfant')).toBeTruthy();
    expect(
      screen.getByText('Enregistrez votre enfant et décrivez ses besoins scolaires.'),
    ).toBeTruthy();
    expect(screen.getByText('Pour moi-même')).toBeTruthy();
    expect(screen.getByText('Suivez un cours ou une formation pour vous-même.')).toBeTruthy();
  });

  it('should render the request options in English', async () => {
    useSessionStore.getState().setLocaleOverride('en');

    await render(<RequestTypeScreen onClose={onClose} onSelect={onSelect} />);

    expect(screen.getByText('Who would you like a tutor for?')).toBeTruthy();
    expect(screen.getByText('For my child')).toBeTruthy();
    expect(screen.getByText('For myself')).toBeTruthy();
    expect(screen.getByText('Get tutoring or training for yourself.')).toBeTruthy();
  });

  it('should report the selected journey type', async () => {
    await render(<RequestTypeScreen onClose={onClose} onSelect={onSelect} />);

    await fireEvent.press(screen.getByTestId('request-type-child'));
    await fireEvent.press(screen.getByTestId('request-type-self'));

    expect(onSelect).toHaveBeenNthCalledWith(1, 'child');
    expect(onSelect).toHaveBeenNthCalledWith(2, 'self');
    expect(onClose).not.toHaveBeenCalled();
  });
});
