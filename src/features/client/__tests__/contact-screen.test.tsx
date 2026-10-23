import { fireEvent, render, screen } from '@testing-library/react-native';

import { ContactScreen } from '../screens/contact-screen';
import type { ClientProfile } from '../types';
import { useSessionStore } from '@/store/session-store';

const existingClient: ClientProfile = {
  id: 'cli_existing',
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
  email: 'amina@example.com',
  address: 'Gombe',
  pinHash: 'hash',
  pinSalt: 'salt',
  createdAt: 100,
  updatedAt: 100,
};

describe('ContactScreen', () => {
  const onBack = jest.fn();
  const onContinue = jest.fn();
  const onContinueExisting = jest.fn();

  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
    onBack.mockReset();
    onContinue.mockReset();
    onContinueExisting.mockReset();
  });

  function renderScreen(clients: readonly ClientProfile[] = []) {
    return render(
      <ContactScreen
        isAdultJourney
        clients={clients}
        onBack={onBack}
        onContinue={onContinue}
        onContinueExisting={onContinueExisting}
      />,
    );
  }

  it('shows inline field errors and does not continue with invalid values', async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId('contact-first-name'), 'Amina');
    await fireEvent.changeText(screen.getByTestId('contact-last-name'), 'Kabila');
    await fireEvent.changeText(screen.getByTestId('contact-phone'), '12345');
    await fireEvent.changeText(screen.getByTestId('contact-email'), 'not-an-email');
    await fireEvent.press(screen.getByTestId('contact-continue'));

    expect(screen.getByText('Enter a valid phone number')).toBeTruthy();
    expect(screen.getByText('Enter a valid email address')).toBeTruthy();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('stores the normalized phone number and continues with valid details', async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId('contact-first-name'), 'Amina');
    await fireEvent.changeText(screen.getByTestId('contact-last-name'), 'Kabila');
    await fireEvent.changeText(screen.getByTestId('contact-phone'), '0812345678');
    await fireEvent.press(screen.getByTestId('contact-continue'));

    expect(onContinue).toHaveBeenCalledWith({
      firstName: 'Amina',
      lastName: 'Kabila',
      phone: '+243812345678',
    });
  });

  it('asks before continuing with an existing client profile', async () => {
    await renderScreen([existingClient]);

    await fireEvent.changeText(screen.getByTestId('contact-first-name'), 'Amina');
    await fireEvent.changeText(screen.getByTestId('contact-last-name'), 'Kabila');
    await fireEvent.changeText(screen.getByTestId('contact-phone'), '0812345678');
    await fireEvent.press(screen.getByTestId('contact-continue'));

    expect(screen.getByText('You already have an account with this number.')).toBeTruthy();
    expect(screen.getByText('Continue with your existing request history?')).toBeTruthy();
    expect(onContinue).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('contact-duplicate-continue'));

    expect(onContinueExisting).toHaveBeenCalledWith(existingClient);
  });

  it('closes the duplicate prompt when another number is chosen', async () => {
    await renderScreen([existingClient]);

    await fireEvent.changeText(screen.getByTestId('contact-first-name'), 'Amina');
    await fireEvent.changeText(screen.getByTestId('contact-last-name'), 'Kabila');
    await fireEvent.changeText(screen.getByTestId('contact-phone'), '0812345678');
    await fireEvent.press(screen.getByTestId('contact-continue'));

    await fireEvent.press(screen.getByTestId('contact-use-another'));

    expect(screen.queryByTestId('contact-duplicate-sheet')).toBeNull();
    expect(onContinueExisting).not.toHaveBeenCalled();
  });
});
