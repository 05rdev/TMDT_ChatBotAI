import { useLanguageStore } from '@/store/useLanguageStore';
import type { TranslationKey } from '@/i18n';

/**
 * Hook dịch text - dùng cho static UI text
 * Usage: const { t, locale } = useTranslation();
 *        t('nav.shop') → "Cửa hàng" / "Shop" / "ショップ" / "쇼핑"
 *        t('cart.itemCount', { count: 3 }) → "Có 3 sản phẩm đang chờ thanh toán"
 */
export const useTranslation = () => {
  const t = useLanguageStore(state => state.t);
  const locale = useLanguageStore(state => state.locale);
  const setLocale = useLanguageStore(state => state.setLocale);

  return { t, locale, setLocale };
};

export type { TranslationKey };
