import { create } from 'zustand';
import { dictionaries, type Locale, type TranslationKey } from '@/i18n';
import Cookies from 'js-cookie';

interface LanguageState {
  locale: Locale;
  hydrated: boolean;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  locale: 'vi',
  hydrated: false,

  setLocale: (locale: Locale) => {
    Cookies.set('app_lang', locale, { expires: 365, path: '/' });
    document.documentElement.lang = locale;
    set({ locale });
  },

  t: (key: TranslationKey, params?: Record<string, string | number>): string => {
    const { locale } = get();
    const dict = dictionaries[locale] || dictionaries.vi;
    let text = dict[key] || dictionaries.vi[key] || key;

    // Replace {param} placeholders
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }

    return text;
  },
}));
