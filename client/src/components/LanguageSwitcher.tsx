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
        className="flex items-center space-x-2 p-2.5 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all group"
      >
        <Languages className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">{currentLangObj.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-background border-4 border-foreground shadow-[6px_6px_0px_0px_var(--foreground)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b-2 border-foreground bg-accent text-[10px] font-black uppercase tracking-widest">
            Chọn ngôn ngữ
          </div>
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase transition-colors ${
                  currentLang === lang.code 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-secondary text-foreground'
                }`}
              >
                <span>{lang.flag} {lang.name}</span>
                {currentLang === lang.code && <div className="w-1.5 h-1.5 bg-background rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
