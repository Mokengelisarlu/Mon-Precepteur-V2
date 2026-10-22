import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTranslation } from '@/hooks/use-translation';
import { useSessionStore } from '@/store/session-store';

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'fr', languageTag: 'fr-FR' }],
}));

function Probe(): React.JSX.Element {
  const { t, locale, setLocale, isRTL } = useTranslation();

  return (
    <View>
      <Text testID="label">{t('validation.pin.mismatch')}</Text>
      <Text testID="locale">{locale}</Text>
      <Text testID="direction">{isRTL ? 'rtl' : 'ltr'}</Text>
      <Pressable testID="switch" onPress={() => setLocale('en')}>
        <Text>switch</Text>
      </Pressable>
    </View>
  );
}

describe('useTranslation', () => {
  beforeEach(() => {
    useSessionStore.setState({ localeOverride: null });
  });

  it('should translate with the device locale when no override exists', async () => {
    const { getByTestId } = await render(<Probe />);

    expect(getByTestId('label')).toHaveTextContent('Les codes ne correspondent pas');
    expect(getByTestId('locale')).toHaveTextContent('fr');
  });

  it('should switch the language through the session store', async () => {
    const { getByTestId } = await render(<Probe />);

    await fireEvent.press(getByTestId('switch'));

    expect(getByTestId('label')).toHaveTextContent('The codes do not match');
    expect(getByTestId('locale')).toHaveTextContent('en');
    expect(useSessionStore.getState().localeOverride).toBe('en');
  });

  it('should report a left-to-right direction for both locales', async () => {
    const { getByTestId } = await render(<Probe />);

    expect(getByTestId('direction')).toHaveTextContent('ltr');
  });
});

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ localeOverride: null });
  });

  it('should store and clear the locale override', () => {
    expect(useSessionStore.getState().localeOverride).toBeNull();

    useSessionStore.getState().setLocaleOverride('en');

    expect(useSessionStore.getState().localeOverride).toBe('en');

    useSessionStore.getState().clearLocaleOverride();

    expect(useSessionStore.getState().localeOverride).toBeNull();
  });
});
