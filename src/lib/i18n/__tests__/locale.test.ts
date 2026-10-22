import { getLocales } from 'expo-localization';

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectDeviceLocale,
  isLocale,
  isRTL,
  resolveLocale,
} from '@/lib/i18n';

jest.mock('expo-localization', () => ({ getLocales: jest.fn() }));

const getLocalesMock = jest.mocked(getLocales);

function setDeviceLocale(languageCode: string | null): void {
  getLocalesMock.mockReturnValue([
    { languageCode, languageTag: languageCode ?? 'und' },
  ] as unknown as ReturnType<typeof getLocales>);
}

describe('detectDeviceLocale', () => {
  it('should use English when the device language is English', () => {
    setDeviceLocale('en');

    expect(detectDeviceLocale()).toBe('en');
  });

  it('should use French when the device language is French', () => {
    setDeviceLocale('fr');

    expect(detectDeviceLocale()).toBe('fr');
  });

  it('should default to French for an unsupported device language', () => {
    setDeviceLocale('de');

    expect(detectDeviceLocale()).toBe(DEFAULT_LOCALE);
  });

  it('should default to French when the device exposes no language', () => {
    setDeviceLocale(null);

    expect(detectDeviceLocale()).toBe(DEFAULT_LOCALE);
  });

  it('should default to French when the device exposes no locale', () => {
    getLocalesMock.mockReturnValue([] as unknown as ReturnType<typeof getLocales>);

    expect(detectDeviceLocale()).toBe(DEFAULT_LOCALE);
  });
});

describe('resolveLocale', () => {
  it('should prefer the explicit override to the device locale', () => {
    setDeviceLocale('fr');

    expect(resolveLocale('en')).toBe('en');
  });

  it('should ignore an unsupported override', () => {
    setDeviceLocale('en');

    expect(resolveLocale('de')).toBe('en');
  });

  it('should fall back to the device locale when no override exists', () => {
    setDeviceLocale('en');

    expect(resolveLocale(null)).toBe('en');
    expect(resolveLocale()).toBe('en');
  });
});

describe('isLocale', () => {
  it('should accept the supported locales only', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('should declare French and English as supported', () => {
    expect(SUPPORTED_LOCALES).toEqual(['fr', 'en']);
  });
});

describe('isRTL', () => {
  it('should report left-to-right for both supported locales', () => {
    expect(isRTL('fr')).toBe(false);
    expect(isRTL('en')).toBe(false);
  });
});
