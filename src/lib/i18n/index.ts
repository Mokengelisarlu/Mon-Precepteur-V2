export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectDeviceLocale,
  isLocale,
  isRTL,
  resolveLocale,
  type Locale,
} from './locale';
export { en } from './locales/en';
export { fr } from './locales/fr';
export { pluralCategory, translate } from './translate';
export type {
  PluralBaseKey,
  TranslateKey,
  TranslationKey,
  TranslationParams,
} from './types';
