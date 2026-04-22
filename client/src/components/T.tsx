'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/useLanguageStore';
import { translateText } from '@/lib/translate';

const CACHE_KEY = 'ultrashop_translate_cache';
const MAX_CACHE_SIZE = 500;

const getCache = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const setCache = (key: string, value: string) => {
  try {
    const cache = getCache();
    // Evict oldest entries if cache is too large
    const keys = Object.keys(cache);
    if (keys.length >= MAX_CACHE_SIZE) {
      const toRemove = keys.slice(0, keys.length - MAX_CACHE_SIZE + 50);
      toRemove.forEach(k => delete cache[k]);
    }
    cache[key] = value;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full - clear and retry
    localStorage.removeItem(CACHE_KEY);
  }
};

/**
 * Component dịch dynamic content (tên sản phẩm, mô tả từ DB)
 * Dùng Google Translate API với cache localStorage
 * Usage: <T>Tên sản phẩm từ database</T>
 */
export const T = ({ children }: { children: string }) => {
  const locale = useLanguageStore(state => state.locale);
  const [translated, setTranslated] = useState(children);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (locale === 'vi' || !children) {
      setTranslated(children);
      return;
    }

    const cacheKey = `${locale}:${children}`;
    const cached = getCache()[cacheKey];
    if (cached) {
      setTranslated(cached);
      return;
    }

    // Show original text while translating (no flash)
    setTranslated(children);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    translateText(children, locale)
      .then(result => {
        if (!controller.signal.aborted) {
          setTranslated(result);
          setCache(cacheKey, result);
        }
      })
      .catch(() => {
        // Keep original text on error
      });

    return () => controller.abort();
  }, [children, locale]);

  return <>{translated}</>;
};
