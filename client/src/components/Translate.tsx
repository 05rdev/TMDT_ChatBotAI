'use client';

import React, { useState, useEffect } from 'react';
import { translateText } from '@/lib/translate';

interface TranslateProps {
  children: string;
}

export const Translate = ({ children }: TranslateProps) => {
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    const locale = localStorage.getItem('app_lang') || 'vi';
    if (locale === 'vi') {
      setTranslatedText(children);
      return;
    }

    const performTranslation = async () => {
      const result = await translateText(children, locale);
      setTranslatedText(result);
    };

    performTranslation();
  }, [children]);

  return <>{translatedText}</>;
};
