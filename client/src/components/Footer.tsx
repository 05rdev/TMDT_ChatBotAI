'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Mail, Phone, MapPin, Globe, ExternalLink, Play, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/i18n';

const footerText: Record<Locale, {
  description: string;
  newsletterTitle: string;
  emailPlaceholder: string;
  shop: string;
  allProducts: string;
  newProducts: string;
  bestSelling: string;
  about: string;
  support: string;
  trackOrder: string;
  supportCenter: string;
  returnPolicy: string;
  privacyPolicy: string;
  terms: string;
  contact: string;
  address: string;
  rights: string;
  payment: string;
}> = {
  vi: {
    description: 'Nền tảng mua sắm thông minh với sức mạnh AI. Sản phẩm chính hãng, giao hàng nhanh chóng, bảo hành uy tín.',
    newsletterTitle: 'Nhận ưu đãi mới nhất',
    emailPlaceholder: 'Email của bạn...',
    shop: 'Cửa hàng',
    allProducts: 'Tất cả sản phẩm',
    newProducts: 'Sản phẩm mới',
    bestSelling: 'Bán chạy nhất',
    about: 'Giới thiệu',
    support: 'Hỗ trợ',
    trackOrder: 'Theo dõi đơn hàng',
    supportCenter: 'Trung tâm hỗ trợ',
    returnPolicy: 'Chính sách đổi trả',
    privacyPolicy: 'Chính sách bảo mật',
    terms: 'Điều khoản sử dụng',
    contact: 'Liên hệ',
    address: '12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP.HCM',
    rights: 'Đã đăng ký bản quyền.',
    payment: 'Thanh toán',
  },
  en: {
    description: 'A smart shopping platform powered by AI. Genuine products, fast delivery, and reliable warranty service.',
    newsletterTitle: 'Get the latest offers',
    emailPlaceholder: 'Your email...',
    shop: 'Shop',
    allProducts: 'All products',
    newProducts: 'New arrivals',
    bestSelling: 'Best sellers',
    about: 'About us',
    support: 'Support',
    trackOrder: 'Track orders',
    supportCenter: 'Support center',
    returnPolicy: 'Return policy',
    privacyPolicy: 'Privacy policy',
    terms: 'Terms of use',
    contact: 'Contact',
    address: '12 Nguyen Van Bao Street, Ward 4, Go Vap, Ho Chi Minh City',
    rights: 'All rights reserved.',
    payment: 'Payment',
  },
  ja: {
    description: 'AIを活用したスマートショッピングプラットフォーム。正規品、迅速な配送、信頼できる保証を提供します。',
    newsletterTitle: '最新のお得情報を受け取る',
    emailPlaceholder: 'メールアドレス...',
    shop: 'ショップ',
    allProducts: 'すべての商品',
    newProducts: '新着商品',
    bestSelling: '売れ筋商品',
    about: '紹介',
    support: 'サポート',
    trackOrder: '注文を追跡',
    supportCenter: 'サポートセンター',
    returnPolicy: '返品ポリシー',
    privacyPolicy: 'プライバシーポリシー',
    terms: '利用規約',
    contact: 'お問い合わせ',
    address: 'ホーチミン市ゴーバップ区4坊 Nguyen Van Bao 12',
    rights: 'All rights reserved.',
    payment: 'お支払い',
  },
  ko: {
    description: 'AI 기반 스마트 쇼핑 플랫폼입니다. 정품 상품, 빠른 배송, 신뢰할 수 있는 보증 서비스를 제공합니다.',
    newsletterTitle: '최신 혜택 받기',
    emailPlaceholder: '이메일 주소...',
    shop: '쇼핑',
    allProducts: '전체 상품',
    newProducts: '신상품',
    bestSelling: '베스트셀러',
    about: '소개',
    support: '지원',
    trackOrder: '주문 조회',
    supportCenter: '고객 지원 센터',
    returnPolicy: '반품 정책',
    privacyPolicy: '개인정보 처리방침',
    terms: '이용 약관',
    contact: '문의',
    address: '호치민시 고밥군 4동 Nguyen Van Bao 12',
    rights: 'All rights reserved.',
    payment: '결제',
  },
};

export function Footer() {
  const { locale } = useTranslation();
  const text = footerText[locale];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-12 md:mt-16">
      <div className="page-shell py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-10">
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-primary rounded-[var(--radius-md)] flex items-center justify-center transition-transform group-hover:scale-105">
                <Bot className="text-primary-foreground w-5.5 h-5.5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Ultra<span className="text-primary">Shop</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{text.description}</p>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{text.newsletterTitle}</p>
              <div className="flex min-w-0">
                <input
                  type="email"
                  placeholder={text.emailPlaceholder}
                  className="min-w-0 flex-1 bg-background border border-border border-r-0 rounded-l-[8px] px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button className="px-3 bg-primary text-primary-foreground rounded-r-[8px] hover:bg-primary-hover transition-colors" aria-label={text.newsletterTitle}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{text.shop}</h4>
            <nav className="flex flex-col space-y-2.5">
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">{text.allProducts}</Link>
              <Link href="/shop?sort=newest" className="text-sm text-muted-foreground hover:text-primary transition-colors">{text.newProducts}</Link>
              <Link href="/shop?sort=best_selling" className="text-sm text-muted-foreground hover:text-primary transition-colors">{text.bestSelling}</Link>
              <Link href="/ai-hub" className="text-sm text-muted-foreground hover:text-primary transition-colors">AI Assistant</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{text.about}</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{text.support}</h4>
            <nav className="flex flex-col space-y-2.5">
              <Link href="/profile/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">{text.trackOrder}</Link>
              <Link href="/profile/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">{text.supportCenter}</Link>
              <span className="text-sm text-muted-foreground">{text.returnPolicy}</span>
              <span className="text-sm text-muted-foreground">{text.privacyPolicy}</span>
              <span className="text-sm text-muted-foreground">{text.terms}</span>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{text.contact}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground leading-relaxed">{text.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">0123 456 789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">contact@ultrashop.com</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a href="#" className="w-9 h-9 bg-secondary rounded-[var(--radius-md)] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-secondary rounded-[var(--radius-md)] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" aria-label="Link">
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-secondary rounded-[var(--radius-md)] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" aria-label="Video">
                <Play className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="page-shell py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {currentYear} UltraShop. {text.rights}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">{text.payment}</span>
            <div className="flex items-center gap-1.5">
              {['VISA', 'MC', 'MOMO'].map((method) => (
                <span key={method} className="px-2 py-0.5 bg-secondary border border-border rounded text-[10px] font-bold text-muted-foreground">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
