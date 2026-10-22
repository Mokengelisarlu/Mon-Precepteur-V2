import { en, fr, type TranslationKey } from '@/lib/i18n';

const enKeys = (Object.keys(en) as TranslationKey[]).sort();
const frKeys = (Object.keys(fr) as TranslationKey[]).sort();
const pluralBases = enKeys
  .filter((key) => key.endsWith('_one'))
  .map((key) => key.slice(0, -'_one'.length));

describe('dictionaries', () => {
  it('should expose the same key set in English and French', () => {
    expect(frKeys).toEqual(enKeys);
  });

  it('should not contain an empty value', () => {
    for (const key of enKeys) {
      expect(en[key].trim()).not.toBe('');
    }

    for (const key of frKeys) {
      expect(fr[key].trim()).not.toBe('');
    }
  });

  it('should declare both plural forms for every plural base', () => {
    expect(pluralBases.length).toBeGreaterThan(0);

    for (const base of pluralBases) {
      expect(enKeys).toContain(`${base}_one`);
      expect(enKeys).toContain(`${base}_other`);
      expect(frKeys).toContain(`${base}_one`);
      expect(frKeys).toContain(`${base}_other`);
    }
  });

  it('should keep the same placeholders in both languages', () => {
    const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

    for (const key of enKeys) {
      expect(placeholders(fr[key])).toEqual(placeholders(en[key]));
    }
  });
});
