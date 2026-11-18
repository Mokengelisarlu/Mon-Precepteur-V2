import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { ClientProfile } from '@/features/client/types';
import {
  WelcomeScreen,
  type WelcomeScreenProps,
} from '@/features/request/screens/welcome-screen';
import { hashPin } from '@/lib/crypto/pin';
import { useClientStore } from '@/store/client-store';
import { useSessionStore } from '@/store/session-store';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Welcome screen', () => {
  const onGetStarted = jest.fn();
  const onLoginSuccess = jest.fn();

  function renderWelcome(props: Partial<WelcomeScreenProps> = {}) {
    return render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <WelcomeScreen
          onGetStarted={onGetStarted}
          onLoginSuccess={onLoginSuccess}
          {...props}
        />
      </SafeAreaProvider>,
    );
  }

  beforeEach(() => {
    useSessionStore.getState().clearLocaleOverride();
    useClientStore.setState({ clients: [] });
    onGetStarted.mockReset();
    onLoginSuccess.mockReset();
  });

  it('should render the approved Welcome content and connection form in French by default', async () => {
    await renderWelcome();

    expect(screen.getByRole('header')).toHaveTextContent(
      "Votre parcours d'apprentissage commence ici !",
    );
    expect(screen.getByTestId('welcome-hero')).toBeTruthy();
    expect(
      screen.getByText('Des tuteurs de confiance pour un meilleur avenir.'),
    ).toBeTruthy();

    expect(screen.getByTestId('welcome-phone-input')).toBeTruthy();
    expect(screen.getByTestId('welcome-pin-input')).toBeTruthy();
    expect(screen.getByTestId('welcome-login-submit')).toHaveTextContent('Se connecter');
    expect(screen.getByTestId('welcome-get-started')).toHaveTextContent('Commencer');
    // Credit line
    expect(screen.getByText('Powerd by Mokengeli Sarlu')).toBeTruthy();
  });

  it('should render the approved Welcome content and connection form in English', async () => {
    useSessionStore.getState().setLocaleOverride('en');

    await renderWelcome();

    expect(screen.getByRole('header')).toHaveTextContent('Your learning journey starts here!');
    expect(screen.getByTestId('welcome-hero')).toBeTruthy();
    expect(screen.getByText('Find the perfect tutor for your child or for yourself.')).toBeTruthy();
    expect(screen.getByTestId('welcome-login-submit')).toHaveTextContent('Log in');
    expect(screen.getByTestId('welcome-get-started')).toHaveTextContent('Get started');
    // Credit line
    expect(screen.getByText('Powerd by Mokengeli Sarlu')).toBeTruthy();
  });

  it('should call the Get started action', async () => {
    await renderWelcome();

    await fireEvent.press(screen.getByTestId('welcome-get-started'));

    expect(onGetStarted).toHaveBeenCalledTimes(1);
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('validates phone number on connection submit', async () => {
    await renderWelcome();

    await fireEvent.changeText(screen.getByTestId('welcome-phone-input'), '123');
    await fireEvent.changeText(screen.getByTestId('welcome-pin-input'), '123456');
    await fireEvent.press(screen.getByTestId('welcome-login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('welcome-phone-input-error')).toHaveTextContent(
        'Saisissez un numéro de téléphone valide',
      );
    });
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('validates PIN format on connection submit', async () => {
    await renderWelcome();

    await fireEvent.changeText(screen.getByTestId('welcome-phone-input'), '0812345678');
    await fireEvent.changeText(screen.getByTestId('welcome-pin-input'), '12');
    await fireEvent.press(screen.getByTestId('welcome-login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('welcome-pin-input-error')).toHaveTextContent(
        'Le code doit contenir 6 chiffres',
      );
    });
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('displays error when client profile does not exist or PIN is wrong', async () => {
    await renderWelcome();

    await fireEvent.changeText(screen.getByTestId('welcome-phone-input'), '0812345678');
    await fireEvent.changeText(screen.getByTestId('welcome-pin-input'), '123456');
    await fireEvent.press(screen.getByTestId('welcome-login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('welcome-login-error')).toHaveTextContent(
        'Numéro de téléphone ou code PIN incorrect.',
      );
    });
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('authenticates existing client and calls onLoginSuccess', async () => {
    const salt = '0123456789abcdef';
    const hash = await hashPin('123456', salt);
    const existingClient: ClientProfile = {
      id: 'client-1',
      firstName: 'Marie',
      lastName: 'Kabila',
      phone: '+243812345678',
      pinSalt: salt,
      pinHash: hash,
      createdAt: 1000,
      updatedAt: 1000,
    };
    useClientStore.setState({ clients: [existingClient] });

    await renderWelcome();

    await fireEvent.changeText(screen.getByTestId('welcome-phone-input'), '0812345678');
    await fireEvent.changeText(screen.getByTestId('welcome-pin-input'), '123456');
    await fireEvent.press(screen.getByTestId('welcome-login-submit'));

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledWith(existingClient);
    });
  });
});
