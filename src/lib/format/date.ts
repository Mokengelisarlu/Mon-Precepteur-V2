import type { Locale } from '@/lib/i18n';

import { type DateInput, toDate } from './date-input';
import { normalizeSpaces } from './normalize';

export function formatDate(input: DateInput, locale: Locale): string {
  const date = toDate(input);

  if (date === null) {
    return '';
  }

  return normalizeSpaces(new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date));
}

export function formatDateTime(input: DateInput, locale: Locale): string {
  const date = toDate(input);

  if (date === null) {
    return '';
  }

  const formatted = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);

  return normalizeSpaces(formatted);
}
