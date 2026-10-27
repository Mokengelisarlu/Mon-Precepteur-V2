import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 24, right: 0, bottom: 0, left: 0 },
        }}
      >
        <ContactScreen
          clients={clients}
          onBack={onBack}
          onContinue={onContinue}
          onContinueExisting={onContinueExisting}
        />
      </SafeAreaProvider>,
    );
  }

  async function fillIdentity(phone = '0812345678', email = ''): Promise<void> {
    await fireEvent.changeText(screen.getByTestId('contact-last-name'), 'Kabila');
    await fireEvent.changeText(screen.getByTestId('contact-first-name'), 'Amina');
    await fireEvent.changeText(screen.getByTestId('contact-phone'), phone);
    await fireEvent.changeText(screen.getByTestId('contact-email'), email);
  }

  async function continueToAddress(): Promise<void> {
    await fireEvent.press(screen.getByTestId('contact-continue'));
  }

  async function fillAddress(): Promise<void> {
    await fireEvent.changeText(screen.getByTestId('contact-commune'), 'Kampemba');
    await fireEvent.changeText(screen.getByTestId('contact-quartier'), 'Bel-Air');
    await fireEvent.changeText(screen.getByTestId('contact-avenue'), 'Avenue Lumumba');
    await fireEvent.changeText(screen.getByTestId('contact-number'), '12B');
  }

  it('uses the onboarding-style two-step progress and defaults the city to Lubumbashi', async () => {
    await renderScreen();

    expect(screen.getByText('Your contact details')).toBeTruthy();
    expect(screen.getByTestId('contact-progress')).toBeTruthy();
    await fillIdentity();
    await continueToAddress();

    expect(screen.getByText('Full address')).toBeTruthy();
    expect(screen.getByText('Lubumbashi')).toBeTruthy();
    expect(screen.getByTestId('contact-previous')).toBeTruthy();
  });

  it('shows inline identity errors and does not advance with invalid values', async () => {
    await renderScreen();

    await fillIdentity('12345', 'not-an-email');
    await continueToAddress();

    expect(screen.getByText('Enter a valid phone number')).toBeTruthy();
    expect(screen.getByText('Enter a valid email address')).toBeTruthy();
    expect(screen.queryByTestId('contact-commune')).toBeNull();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('stores normalized contact details and the complete address', async () => {
    await renderScreen();

    await fillIdentity();
    await continueToAddress();
    await fillAddress();
    await fireEvent.press(screen.getByTestId('contact-continue'));

    expect(onContinue).toHaveBeenCalledWith({
      firstName: 'Amina',
      lastName: 'Kabila',
      phone: '+243812345678',
      city: 'Lubumbashi',
      commune: 'Kampemba',
      quartier: 'Bel-Air',
      avenue: 'Avenue Lumumba',
      number: '12B',
      address: '12B, Avenue Lumumba, Bel-Air, Kampemba, Lubumbashi',
    });
  });

  it('asks before continuing with an existing client profile', async () => {
    await renderScreen([existingClient]);

    await fillIdentity();
    await continueToAddress();
    await fillAddress();
    await fireEvent.press(screen.getByTestId('contact-continue'));

    expect(screen.getByText('You already have an account with this number.')).toBeTruthy();
    expect(screen.getByText('Continue with your existing request history?')).toBeTruthy();
    expect(onContinue).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('contact-duplicate-continue'));

    expect(onContinueExisting).toHaveBeenCalledWith(existingClient, {
      firstName: 'Amina',
      lastName: 'Kabila',
      phone: '+243812345678',
      city: 'Lubumbashi',
      commune: 'Kampemba',
      quartier: 'Bel-Air',
      avenue: 'Avenue Lumumba',
      number: '12B',
      address: '12B, Avenue Lumumba, Bel-Air, Kampemba, Lubumbashi',
    });
  });

  it('closes the duplicate prompt when another number is chosen', async () => {
    await renderScreen([existingClient]);

    await fillIdentity();
    await continueToAddress();
    await fillAddress();
    await fireEvent.press(screen.getByTestId('contact-continue'));
    await fireEvent.press(screen.getByTestId('contact-use-another'));

    expect(screen.queryByTestId('contact-duplicate-sheet')).toBeNull();
    expect(onContinueExisting).not.toHaveBeenCalled();
    expect(screen.getByTestId('contact-phone')).toBeTruthy();
  });
});
