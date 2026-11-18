import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/feedback';
import { useSessionStore } from '@/store/session-store';

import { PinScreen } from '../screens/pin-screen';

describe('PinScreen', () => {
  const onBack = jest.fn();
  const onCreatePin = jest.fn<Promise<void>, [string]>();
  const onVerifyPin = jest.fn<Promise<boolean>, [string]>();

  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
    onBack.mockReset();
    onCreatePin.mockReset().mockResolvedValue(undefined);
    onVerifyPin.mockReset().mockResolvedValue(true);
  });

  function renderScreen(isExistingClient = false) {
    return render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 24, right: 0, bottom: 0, left: 0 },
        }}
      >
        <ToastHost>
          <PinScreen
            isAdultJourney
            isExistingClient={isExistingClient}
            onBack={onBack}
            onCreatePin={onCreatePin}
            onVerifyPin={onVerifyPin}
          />
        </ToastHost>
      </SafeAreaProvider>,
    );
  }

  it('shows the prototype limitation and creates a PIN only when confirmation matches', async () => {
    await renderScreen();

    expect(screen.getByText('Create your access code')).toBeTruthy();
    expect(
      screen.getByText(
        'Demo only: this code is stored on your device in a hashed form. It is not real authentication.',
      ),
    ).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('pin-entry'), '482659');
    await fireEvent.changeText(screen.getByTestId('pin-confirm'), '482658');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    expect(await screen.findByText('The codes do not match')).toBeTruthy();
    expect(onCreatePin).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId('pin-confirm'), '482659');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    expect(onCreatePin).toHaveBeenCalledWith('482659');
  });

  it('rejects a PIN that is not exactly six digits', async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId('pin-entry'), '482');
    await fireEvent.changeText(screen.getByTestId('pin-confirm'), '482');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    expect(screen.getAllByText('The code must be 6 digits')).toHaveLength(2);
    expect(onCreatePin).not.toHaveBeenCalled();
  });

  it('verifies an existing profile PIN without showing PIN creation fields', async () => {
    await renderScreen(true);

    expect(screen.getByText('Enter your access code')).toBeTruthy();
    expect(screen.queryByTestId('pin-confirm')).toBeNull();

    await fireEvent.changeText(screen.getByTestId('pin-entry'), '482659');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    expect(onVerifyPin).toHaveBeenCalledWith('482659');
    expect(onCreatePin).not.toHaveBeenCalled();
  });

  it('shows an inline error and remains on the screen when the existing PIN is incorrect', async () => {
    onVerifyPin.mockResolvedValue(false);
    await renderScreen(true);

    await fireEvent.changeText(screen.getByTestId('pin-entry'), '000000');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    expect(await screen.findByText('That code does not match this profile')).toBeTruthy();
    expect(onCreatePin).not.toHaveBeenCalled();
  });

  it('surfaces PIN creation failures in a toast', async () => {
    onCreatePin.mockRejectedValue(new Error('Crypto unavailable'));
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId('pin-entry'), '482659');
    await fireEvent.changeText(screen.getByTestId('pin-confirm'), '482659');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    expect(await screen.findByText('The code could not be saved. Try again.')).toBeTruthy();
  });
});
