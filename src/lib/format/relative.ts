import { type Locale, translate } from '@/lib/i18n';

import { formatDate } from './date';
import { type DateInput, toDate } from './date-input';
import { normalizeSpaces } from './normalize';

type RelativeUnit = Intl.RelativeTimeFormatUnit;

const MINUTE_MILLISECONDS = 60_000;

const UNIT_MILLISECONDS: readonly (readonly [RelativeUnit, number])[] = [
  ['year', 31_557_600_000],
  ['month', 2_629_800_000],
  ['week', 604_800_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', MINUTE_MILLISECONDS],
];

export function formatRelativeTime(
  input: DateInput,
  locale: Locale,
  now: Date = new Date(),
): string {
  const date = toDate(input);

  if (date === null) {
    return '';
  }

  if (typeof Intl.RelativeTimeFormat !== 'function') {
    return formatDate(date, locale);
  }

  const difference = date.getTime() - now.getTime();
  const magnitude = Math.abs(difference);

  if (magnitude < MINUTE_MILLISECONDS) {
    return translate(locale, 'common.now');
  }

  const [unit, milliseconds] = UNIT_MILLISECONDS.find(([, ms]) => magnitude >= ms) ?? [
    'minute',
    MINUTE_MILLISECONDS,
  ];
  const formatted = new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(
    Math.round(difference / milliseconds),
    unit,
  );

  return normalizeSpaces(formatted);
}
