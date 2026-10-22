import { fireEvent, render, screen } from '@testing-library/react-native';

import { WelcomeScreen } from '@/features/request/screens/welcome-screen';
import { useSessionStore } from '@/store/session-store';

describe('Welcome screen', () => {
  beforeEach(() => {
    useSessionStore.getState().clearLocaleOverride();
  });

  it('should render the French copy by default', async () => {
    await render(
      <WelcomeScreen onGetStarted={jest.fn()} onOpenAdmin={jest.fn()} />,
    );

    expect(screen.getByText('Votre besoin, notre précepteur.')).toBeTruthy();
    expect(
      screen.getByText(
        'Décrivez votre besoin. Nous trouvons le précepteur, préparons le contrat et gérons les formalités.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Commencer')).toBeTruthy();
    expect(screen.getByText('Langue')).toBeTruthy();
  });

  it('should render the English copy when the locale is overridden', async () => {
    useSessionStore.getState().setLocaleOverride('en');

    await render(
      <WelcomeScreen onGetStarted={jest.fn()} onOpenAdmin={jest.fn()} />,
    );

    expect(screen.getByText('Your need, our tutor.')).toBeTruthy();
    expect(screen.getByText('Get Started')).toBeTruthy();
    expect(screen.getByText('Language')).toBeTruthy();
  });

  it('should change every visible copy when the language switch is used', async () => {
    await render(
      <WelcomeScreen onGetStarted={jest.fn()} onOpenAdmin={jest.fn()} />,
    );

    expect(screen.getByText('Commencer')).toBeTruthy();

    await fireEvent.press(screen.getByText('EN'));

    expect(screen.getByText('Get Started')).toBeTruthy();
    expect(screen.getByText('Your need, our tutor.')).toBeTruthy();
    expect(screen.queryByText('Commencer')).toBeNull();

    await fireEvent.press(screen.getByText('FR'));

    expect(screen.getByText('Commencer')).toBeTruthy();
    expect(screen.getByText('Votre besoin, notre précepteur.')).toBeTruthy();
  });

  it('should show the three reassurance points', async () => {
    await render(
      <WelcomeScreen onGetStarted={jest.fn()} onOpenAdmin={jest.fn()} />,
    );

    expect(screen.getByText('Un précepteur adapté à vos besoins')).toBeTruthy();
    expect(screen.getByText('Un contrat écrit')).toBeTruthy();
    expect(screen.getByText('Un paiement vérifié avant de commencer')).toBeTruthy();
  });

  it('should expose the admin simulation entry with its notice', async () => {
    await render(
      <WelcomeScreen onGetStarted={jest.fn()} onOpenAdmin={jest.fn()} />,
    );

    expect(screen.getByTestId('admin-simulation-banner')).toBeTruthy();
    expect(screen.getByText('Administration (simulation)')).toBeTruthy();
  });

  it('should call the primary action', async () => {
    const onGetStarted = jest.fn();

    await render(
      <WelcomeScreen onGetStarted={onGetStarted} onOpenAdmin={jest.fn()} />,
    );

    await fireEvent.press(screen.getByTestId('welcome-get-started'));

    expect(onGetStarted).toHaveBeenCalledTimes(1);
  });

  it('should hide the continue entry when no draft exists', async () => {
    await render(
      <WelcomeScreen onGetStarted={jest.fn()} onOpenAdmin={jest.fn()} />,
    );

    expect(screen.queryByTestId('welcome-continue-request')).toBeNull();
    expect(screen.queryByTestId('welcome-continue-sheet')).toBeNull();
  });

  it('should open the continue sheet when a draft exists', async () => {
    const onContinueRequest = jest.fn();

    await render(
      <WelcomeScreen
        onGetStarted={jest.fn()}
        onOpenAdmin={jest.fn()}
        onContinueRequest={onContinueRequest}
        hasDraft
      />,
    );

    await fireEvent.press(screen.getByTestId('welcome-continue-request'));

    expect(screen.getByTestId('welcome-continue-sheet')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('welcome-continue-confirm'));

    expect(onContinueRequest).toHaveBeenCalledTimes(1);
  });

  it('should show a dismissible banner when the restoration fails', async () => {
    await render(
      <WelcomeScreen
        onGetStarted={jest.fn()}
        onOpenAdmin={jest.fn()}
        restorationState="failed"
      />,
    );

    expect(screen.getByTestId('welcome-restoration-banner')).toBeTruthy();

    await fireEvent.press(screen.getByText('Fermer'));

    expect(screen.queryByTestId('welcome-restoration-banner')).toBeNull();
  });

  it('should show the restoring state instead of the content', async () => {
    await render(
      <WelcomeScreen
        onGetStarted={jest.fn()}
        onOpenAdmin={jest.fn()}
        restorationState="restoring"
      />,
    );

    expect(screen.getByTestId('welcome-restoring')).toBeTruthy();
    expect(screen.queryByTestId('welcome-get-started')).toBeNull();
  });
});
