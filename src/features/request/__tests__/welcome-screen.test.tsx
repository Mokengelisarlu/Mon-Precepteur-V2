import { fireEvent, render, screen } from '@testing-library/react-native';

import { WelcomeScreen } from '@/features/request/screens/welcome-screen';
import { useSessionStore } from '@/store/session-store';

describe('Welcome screen', () => {
  const onGetStarted = jest.fn();
  const onLogin = jest.fn();

  beforeEach(() => {
    useSessionStore.getState().clearLocaleOverride();
    onGetStarted.mockReset();
    onLogin.mockReset();
  });

  it('should render only the approved Welcome content in French by default', async () => {
    await render(
      <WelcomeScreen onGetStarted={onGetStarted} onLogin={onLogin} />,
    );

    expect(screen.getByTestId('welcome-logo')).toBeTruthy();
    expect(screen.getByRole('header')).toHaveTextContent('Mon Précepteur');
    expect(
      screen.getByText(
        'Trouvez le précepteur idéal pour votre enfant ou pour vous-même.',
      ),
    ).toBeTruthy();
    expect(screen.getByTestId('welcome-get-started')).toHaveTextContent('Commencer');
    expect(screen.getByTestId('welcome-login')).toHaveTextContent('Connexion');
    expect(screen.getByTestId('welcome-powered-by')).toHaveTextContent(
      'Propulsé par Mokengeli Sarlu',
    );

    expect(screen.queryByText('Votre besoin, notre précepteur.')).toBeNull();
    expect(screen.queryByTestId('welcome-language-switch')).toBeNull();
    expect(screen.queryByTestId('admin-simulation-link')).toBeNull();
    expect(screen.queryByTestId('welcome-reassurance-list')).toBeNull();
    expect(screen.queryByTestId('welcome-continue-request')).toBeNull();
  });

  it('should render the approved Welcome content in English', async () => {
    useSessionStore.getState().setLocaleOverride('en');

    await render(
      <WelcomeScreen onGetStarted={onGetStarted} onLogin={onLogin} />,
    );

    expect(screen.getByRole('header')).toHaveTextContent('Mon Précepteur');
    expect(screen.getByText('Find the perfect tutor for your child or for yourself.')).toBeTruthy();
    expect(screen.getByTestId('welcome-get-started')).toHaveTextContent('Get started');
    expect(screen.getByTestId('welcome-login')).toHaveTextContent('Login');
    expect(screen.getByTestId('welcome-powered-by')).toHaveTextContent(
      'Powered by Mokengeli Sarlu',
    );
  });

  it('should call the Get started action', async () => {
    await render(
      <WelcomeScreen onGetStarted={onGetStarted} onLogin={onLogin} />,
    );

    await fireEvent.press(screen.getByTestId('welcome-get-started'));

    expect(onGetStarted).toHaveBeenCalledTimes(1);
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('should call the Login action', async () => {
    await render(
      <WelcomeScreen onGetStarted={onGetStarted} onLogin={onLogin} />,
    );

    await fireEvent.press(screen.getByTestId('welcome-login'));

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onGetStarted).not.toHaveBeenCalled();
  });
});
