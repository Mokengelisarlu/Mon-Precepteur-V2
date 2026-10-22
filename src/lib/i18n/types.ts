import type { en } from './locales/en';

export type TranslationKey = keyof typeof en;

type PluralSuffix = '_one' | '_other';

type StripPluralSuffix<Key> = Key extends `${infer Base}${PluralSuffix}` ? Base : never;

export type PluralBaseKey = StripPluralSuffix<TranslationKey>;

export type TranslateKey = TranslationKey | PluralBaseKey;

export type TranslationParams = Readonly<Record<string, string | number>>;
