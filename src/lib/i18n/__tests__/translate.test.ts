import { pluralCategory, translate, type TranslateKey } from '@/lib/i18n';

describe('translate', () => {
  it('should interpolate named parameters', () => {
    expect(translate('en', 'dashboard.needsCount', { count: 3 })).toBe('3 learning needs');
  });

  it('should select the singular form for a count of one', () => {
    expect(translate('en', 'dashboard.needsCount', { count: 1 })).toBe('1 learning need');
    expect(translate('fr', 'dashboard.needsCount', { count: 1 })).toBe('1 besoin');
  });

  it('should apply different plural rules in French and English for zero', () => {
    expect(pluralCategory('fr', 0)).toBe('one');
    expect(pluralCategory('en', 0)).toBe('other');
    expect(translate('fr', 'dashboard.needsCount', { count: 0 })).toBe('0 besoin');
    expect(translate('en', 'dashboard.needsCount', { count: 0 })).toBe('0 learning needs');
  });

  it('should fall back to the base key when no plural form exists', () => {
    expect(translate('en', 'common.cancel', { count: 2 })).toBe('Cancel');
  });

  it('should leave a placeholder untouched when its parameter is missing', () => {
    expect(translate('en', 'dashboard.needsCount_one', {})).toBe('{count} learning need');
  });

  it('should return the key when it is unknown', () => {
    expect(translate('en', 'missing.key' as unknown as TranslateKey)).toBe('missing.key');
  });
});

describe('pluralCategory', () => {
  it('should use the singular for one in English', () => {
    expect(pluralCategory('en', 1)).toBe('one');
    expect(pluralCategory('en', -1)).toBe('one');
    expect(pluralCategory('en', 2)).toBe('other');
  });

  it('should use the singular for zero and one in French', () => {
    expect(pluralCategory('fr', 0)).toBe('one');
    expect(pluralCategory('fr', 1)).toBe('one');
    expect(pluralCategory('fr', 2)).toBe('other');
  });
});
