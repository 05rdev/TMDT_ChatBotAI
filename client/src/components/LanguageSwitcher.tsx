'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguageStore } from '@/store/useLanguageStore';
import type { Locale } from '@/i18n';

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: 'VN' },
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'ja', name: '日本語', flag: 'JP' },
  { code: 'ko', name: '한국어', flag: 'KR' },
];

const selectLanguageLabel: Record<Locale, string> = {
  vi: 'Chọn ngôn ngữ',
  en: 'Select language',
  ja: '言語を選択',
  ko: '언어 선택',
};

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  const currentLangObj = languages.find((language) => language.code === locale) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors"
        aria-label={selectLanguageLabel[locale]}
      >
        <span className="text-xs font-semibold uppercase tracking-wide">{currentLangObj.flag}</span>
        <span className="text-xs font-medium uppercase hidden lg:inline">{currentLangObj.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 card-elevated rounded-[var(--radius-lg)] overflow-hidden z-50 shadow-lg animate-fade-in-up">
          <div className="px-3 py-2 border-b border-border text-xs font-medium text-muted-foreground">
            {selectLanguageLabel[locale]}
          </div>
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${
                  locale === lang.code
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary text-foreground'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wide">{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {locale === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
