'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Mail, Phone, MapPin, Globe, ExternalLink, Play, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-12 md:mt-16">
      {/* Main Footer */}
      <div className="page-shell py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-10">
          
          {/* Column 1: Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-primary rounded-[var(--radius-md)] flex items-center justify-center transition-transform group-hover:scale-105">
                <Bot className="text-primary-foreground w-5.5 h-5.5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Ultra<span className="text-primary">Shop</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Nền tảng mua sắm thông minh với sức mạnh AI — Sản phẩm chính hãng, giao hàng nhanh chóng, bảo hành uy tín.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Nhận ưu đãi mới nhất</p>
              <div className="flex min-w-0">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="min-w-0 flex-1 bg-background border border-border border-r-0 rounded-l-[8px] px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button className="px-3 bg-primary text-primary-foreground rounded-r-[8px] hover:bg-primary-hover transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Cửa hàng</h4>
            <nav className="flex flex-col space-y-2.5">
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Tất cả sản phẩm
              </Link>
              <Link href="/shop?sort=newest" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Sản phẩm mới
              </Link>
              <Link href="/shop?sort=best_selling" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Bán chạy nhất
              </Link>
              <Link href="/ai-hub" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                AI Assistant
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Giới thiệu
              </Link>
            </nav>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Hỗ trợ</h4>
            <nav className="flex flex-col space-y-2.5">
              <Link href="/profile/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Theo dõi đơn hàng
              </Link>
              <Link href="/profile/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Trung tâm hỗ trợ
              </Link>
              <span className="text-sm text-muted-foreground">
                Chính sách đổi trả
              </span>
              <span className="text-sm text-muted-foreground">
                Chính sách bảo mật
              </span>
              <span className="text-sm text-muted-foreground">
                Điều khoản sử dụng
              </span>
            </nav>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP.HCM
                </span>
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

            {/* Social Icons */}
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

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="page-shell py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {currentYear} UltraShop. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">Thanh toán</span>
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
      </div>
    </footer>
  );
}
