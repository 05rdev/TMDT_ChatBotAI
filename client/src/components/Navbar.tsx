'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from './ui/Button';
import { ShoppingCart, User, Search, Menu, Bot, Moon, Sun, Mic, Camera, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { NotificationBell } from './NotificationBell';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar = () => {
  const { user, isAuthenticated, hasHydrated, resetAuth, logout } = useAuthStore();
  const cartItems = useCartStore(state => state.items);
  const fetchCart = useCartStore(state => state.fetchCart);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [navSearchQuery, setNavSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleNavSearch = () => {
    if (!navSearchQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(navSearchQuery.trim())}`);
    setNavSearchQuery('');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    if (!localStorage.getItem('accessToken')) {
      resetAuth();
      return;
    }

    fetchCart();
  }, [hasHydrated, isAuthenticated, fetchCart, resetAuth]);

  // Prevent hydration mismatch for cart badge
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    setCartCount(cartItems.reduce((acc, item) => acc + item.quantity, 0));
  }, [cartItems]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="solid-nav px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
          <div className="w-9 h-9 bg-primary rounded-[var(--radius-md)] flex items-center justify-center transition-transform group-hover:scale-105">
            <Bot className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
            Ultra<span className="text-primary">Shop</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-foreground/80 font-medium hover:text-primary transition-colors">
            {t('nav.home')}
          </Link>
          <Link href="/shop" className="text-foreground/80 font-medium hover:text-primary transition-colors">
            {t('nav.shop')}
          </Link>
          <Link href="/about" className="text-foreground/80 font-medium hover:text-primary transition-colors">
            {t('nav.about')}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <LanguageSwitcher />
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Search Bar in Header */}
          <div className="hidden lg:flex items-center bg-secondary/50 border border-border rounded-[var(--radius-md)] px-3 py-1.5 focus-within:border-primary transition-colors">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavSearch()}
              className="bg-transparent border-none focus:outline-none text-sm w-32 md:w-44 placeholder:text-muted-foreground/60"
            />
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded" title={t('nav.voiceSearch')}>
              <Mic className="w-3.5 h-3.5" />
            </button>
            <button 
              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded" 
              title={t('nav.imageSearch')}
              onClick={() => document.getElementById('navbar-image-upload')?.click()}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              id="navbar-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                  const { toast } = await import('sonner');
                  const api = (await import('@/lib/api')).default;
                  
                  const searchPromise = api.post('/ai/visual-search', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });

                  toast.promise(searchPromise, {
                    loading: 'Đang phân tích hình ảnh...',
                    success: (res) => {
                      if (res.data.data?.products) {
                        sessionStorage.setItem('visual_search_results', JSON.stringify(res.data.data.products));
                        router.push(`/shop?visual=true&t=${Date.now()}`);
                        return 'Đã tìm thấy sản phẩm tương tự!';
                      }
                      return 'Không tìm thấy sản phẩm phù hợp';
                    },
                    error: (err) => 'Lỗi: ' + (err.response?.data?.message || err.message)
                  });
                } catch {
                  const { toast } = await import('sonner');
                  toast.error('Lỗi khởi tạo tìm kiếm');
                } finally {
                  e.target.value = '';
                }
              }}
            />
          </div>

          <button className="lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors">
            <Search className="w-5 h-5" />
          </button>

          <Link href="/cart" className="relative p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors group">
            <ShoppingCart className="w-5 h-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-background animate-in zoom-in duration-200">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:block">
            <NotificationBell />
          </div>

          <div className="hidden sm:block h-6 w-px bg-border mx-1" />

          {hasHydrated && isAuthenticated ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="hidden lg:flex items-center px-3 py-1.5 bg-foreground text-background rounded-[var(--radius-sm)] text-xs font-medium hover:opacity-90 transition-opacity">
                  {t('nav.admin')}
                </Link>
              )}

              <Link href="/profile/support" className="hidden sm:flex p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors" title={t('nav.support')}>
                <MessageSquare className="w-5 h-5" />
              </Link>

              <Link href="/profile" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
              </Link>
              <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={handleLogout}>{t('nav.logout')}</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex">{t('nav.login')}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t('nav.register')}</Button>
              </Link>
            </div>
          )}

          <button className="md:hidden p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};
