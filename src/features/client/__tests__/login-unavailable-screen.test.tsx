import { fireEvent, render, screen } from '@testing-library/react-native';

import { LoginUnavailableScreen } from '@/features/client/screens/login-unavailable-screen';
import { useSessionStore } from '@/store/session-store';

describe('Login unavailable screen', () => {
  const onBackHome = jest.fn();

  beforeEach(() => {
    useSessionStore.getState().clearLocaleOverride();
    onBackHome.mockReset();
  });

  it('should explain in French that login is not available', async () => {
    await render(<LoginUnavailableScreen onBackHome={onBackHome} />);

    expect(screen.getByTestId('login-unavailable-message')).toHaveTextContent(
      "La connexion n'est pas encore disponible dans ce prototype local.",
    );
    expect(screen.getByTestId('login-back-home')).toHaveTextContent("Retour à l'accueil");
  });

  it('should explain in English that login is not available', async () => {
    useSessionStore.getState().setLocaleOverride('en');

    await render(<LoginUnavailableScreen onBackHome={onBackHome} />);

    expect(screen.getByTestId('login-unavailable-message')).toHaveTextContent(
      'Login is not available in this local prototype yet.',
    );
    expect(screen.getByTestId('login-back-home')).toHaveTextContent('Back home');
  });

  it('should call the return action', async () => {
    await render(<LoginUnavailableScreen onBackHome={onBackHome} />);

    await fireEvent.press(screen.getByTestId('login-back-home'));

    expect(onBackHome).toHaveBeenCalledTimes(1);
  });
});
