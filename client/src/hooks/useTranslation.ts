'use client';

import { useState, useEffect } from 'react';
import { translateText } from '@/lib/translate';

export const useTranslation = () => {
  const [locale, setLocale] = useState('vi');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') || 'vi';
    setLocale(savedLang);
  }, []);

  const t = async (text: string) => {
    if (locale === 'vi') return text; // Default is VI, skip translation
    return await translateText(text, locale);
  };

  return { t, locale };
};
