import type { Locale } from './locale';
import { en } from './locales/en';
import { fr } from './locales/fr';
import type { TranslateKey, TranslationParams } from './types';

type Dictionary = Readonly<Record<string, string>>;

type PluralCategory = 'one' | 'other';

const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = { en, fr };

const PLURAL_SUFFIXES: Readonly<Record<PluralCategory, string>> = {
  one: '_one',
  other: '_other',
};

const PLACEHOLDER = /\{(\w+)\}/g;

export function pluralCategory(locale: Locale, count: number): PluralCategory {
  const absolute = Math.abs(count);

  if (locale === 'fr') {
    return absolute === 0 || absolute === 1 ? 'one' : 'other';
  }

  return absolute === 1 ? 'one' : 'other';
}

function interpolate(template: string, params?: TranslationParams): string {
  if (params === undefined) {
    return template;
  }

  return template.replace(PLACEHOLDER, (placeholder: string, name: string) => {
    const value = params[name];

    return value === undefined ? placeholder : String(value);
  });
}

export function translate(locale: Locale, key: TranslateKey, params?: TranslationParams): string {
  const dictionary = DICTIONARIES[locale];
  const count = params?.count;
  const resolvedKey =
    typeof count === 'number' ? `${key}${PLURAL_SUFFIXES[pluralCategory(locale, count)]}` : key;
  const template = dictionary[resolvedKey] ?? dictionary[key] ?? key;

  return interpolate(template, params);
}
