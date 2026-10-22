import { getLocales } from 'expo-localization';

export type Locale = 'en' | 'fr';

export const DEFAULT_LOCALE: Locale = 'fr';

export const SUPPORTED_LOCALES: readonly Locale[] = ['fr', 'en'];

const RTL_LOCALES: readonly Locale[] = [];

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'fr';
}

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function detectDeviceLocale(): Locale {
  const [primary] = getLocales();
  const languageCode = primary?.languageCode?.toLowerCase();

  return isLocale(languageCode) ? languageCode : DEFAULT_LOCALE;
}

export function resolveLocale(override?: string | null): Locale {
  return isLocale(override) ? override : detectDeviceLocale();
}
