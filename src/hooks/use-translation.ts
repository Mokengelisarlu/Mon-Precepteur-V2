import { useCallback } from 'react';

import { useSessionStore } from '@/store/session-store';
import {
  type Locale,
  type TranslateKey,
  type TranslationParams,
  isRTL,
  resolveLocale,
  translate,
} from '@/lib/i18n';

export interface UseTranslationResult {
  readonly t: (key: TranslateKey, params?: TranslationParams) => string;
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
  readonly isRTL: boolean;
}

export function useTranslation(): UseTranslationResult {
  const localeOverride = useSessionStore((state) => state.localeOverride);
  const setLocale = useSessionStore((state) => state.setLocaleOverride);
  const locale = resolveLocale(localeOverride);

  const t = useCallback(
    (key: TranslateKey, params?: TranslationParams) => translate(locale, key, params),
    [locale],
  );

  return {
    t,
    locale,
    setLocale,
    isRTL: isRTL(locale),
  };
}
