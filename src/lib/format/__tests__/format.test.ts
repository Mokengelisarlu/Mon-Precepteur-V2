import {
  formatAmount,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from '@/lib/format';

const afternoon = new Date(2026, 9, 22, 14, 35);

describe('formatAmount', () => {
  it('should format US dollars with the code in English', () => {
    expect(formatAmount(25, 'USD', 'en')).toBe('USD 25.00');
    expect(formatAmount(1234.5, 'USD', 'en')).toBe('USD 1,234.50');
  });

  it('should format US dollars with the local symbol in French', () => {
    expect(formatAmount(25, 'USD', 'fr')).toBe('25,00 $US');
    expect(formatAmount(1234.5, 'USD', 'fr')).toBe('1 234,50 $US');
  });

  it('should return an empty string for a non-finite amount', () => {
    expect(formatAmount(Number.NaN, 'USD', 'fr')).toBe('');
    expect(formatAmount(Number.POSITIVE_INFINITY, 'USD', 'en')).toBe('');
  });
});

describe('formatDate', () => {
  it('should use the English date format', () => {
    expect(formatDate(afternoon, 'en')).toBe('Oct 22, 2026');
  });

  it('should use the French date format', () => {
    expect(formatDate(afternoon, 'fr')).toBe('22 oct. 2026');
  });

  it('should accept an ISO string and return an empty string for an invalid date', () => {
    expect(formatDate('2026-10-22T12:00:00', 'en')).toBe('Oct 22, 2026');
    expect(formatDate('not-a-date', 'en')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('should include the time in both locales', () => {
    expect(formatDateTime(afternoon, 'en')).toBe('Oct 22, 2026, 2:35 PM');
    expect(formatDateTime(afternoon, 'fr')).toBe('22 oct. 2026, 14:35');
  });
});

describe('formatRelativeTime', () => {
  it('should describe a past date in English', () => {
    const now = new Date(2026, 9, 22, 12, 0);

    expect(formatRelativeTime(new Date(2026, 9, 19, 12, 0), 'en', now)).toBe('3 days ago');
  });

  it('should describe a future date in French', () => {
    const now = new Date(2026, 9, 22, 12, 0);

    expect(formatRelativeTime(new Date(2026, 9, 24, 12, 0), 'fr', now)).toBe('dans 2 jours');
  });

  it('should describe the same instant as now', () => {
    const now = new Date(2026, 9, 22, 12, 0);

    expect(formatRelativeTime(now, 'en', now)).toBe('now');
    expect(formatRelativeTime(now, 'fr', now)).toBe('maintenant');
  });

  it('should fall back to an absolute date when the runtime lacks RelativeTimeFormat', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, 'RelativeTimeFormat');

    Object.defineProperty(Intl, 'RelativeTimeFormat', { value: undefined, configurable: true });

    try {
      expect(formatRelativeTime(new Date(2026, 9, 20, 12, 0), 'en', afternoon)).toBe(
        'Oct 20, 2026',
      );
    } finally {
      if (descriptor !== undefined) {
        Object.defineProperty(Intl, 'RelativeTimeFormat', descriptor);
      }
    }
  });

  it('should return an empty string for an invalid date', () => {
    expect(formatRelativeTime('not-a-date', 'fr')).toBe('');
  });
});
