import type { Locale } from '@/lib/i18n';

import { normalizeSpaces } from './normalize';

export type CurrencyCode = 'USD';

const CURRENCY_DISPLAY: Readonly<Record<Locale, 'code' | 'symbol'>> = {
  en: 'code',
  fr: 'symbol',
};

export function formatAmount(amount: number, currency: CurrencyCode, locale: Locale): string {
  if (!Number.isFinite(amount)) {
    return '';
  }

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: CURRENCY_DISPLAY[locale],
  }).format(amount);

  return normalizeSpaces(formatted);
}
