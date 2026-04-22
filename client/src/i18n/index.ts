import vi from './dictionaries/vi';
import en from './dictionaries/en';
import ja from './dictionaries/ja';
import ko from './dictionaries/ko';
import type { Locale, TranslationDictionary } from './types';

export const dictionaries: Record<Locale, TranslationDictionary> = {
  vi,
  en,
  ja,
  ko,
};

export type { Locale, TranslationKey, TranslationDictionary } from './types';
