'use client';

import React, { useState, useEffect } from 'react';
import { Languages, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState('vi');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') || 'vi';
    setCurrentLang(savedLang);
  }, []);

  const changeLanguage = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem('app_lang', code);
    setIsOpen(false);
    // Reload or trigger global update if needed
    window.location.reload(); 
  };

  const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors"
      >
        <Languages className="w-5 h-5" />
        <span className="text-xs font-medium uppercase hidden lg:inline">{currentLangObj.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-44 card-elevated rounded-[var(--radius-lg)] overflow-hidden z-50 shadow-lg">
          <div className="px-3 py-2 border-b border-border text-xs font-medium text-muted-foreground">
            Chọn ngôn ngữ
          </div>
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${
                  currentLang === lang.code 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-secondary text-foreground'
                }`}
              >
                <span>{lang.flag} {lang.name}</span>
                {currentLang === lang.code && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
