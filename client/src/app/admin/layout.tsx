'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, PackageSearch, ShoppingCart, Users, Settings, LogOut, Bot,
  Bell, MessageSquare, Tag, Sparkles, Moon, Sun, Image as ImageIcon, Menu, X
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import api from '@/lib/api';
import type { TranslationKey } from '@/i18n';

const ADMIN_LINKS: { nameKey: TranslationKey; href: string; icon: any }[] = [
  { nameKey: 'admin.overview', href: '/admin', icon: LayoutDashboard },
  { nameKey: 'admin.products', href: '/admin/products', icon: PackageSearch },
  { nameKey: 'admin.categories', href: '/admin/categories', icon: Tag },
  { nameKey: 'admin.orders', href: '/admin/orders', icon: ShoppingCart },
  { nameKey: 'admin.customers', href: '/admin/users', icon: Users },
  { nameKey: 'admin.vouchers', href: '/admin/vouchers', icon: Tag },
  { nameKey: 'admin.banner', href: '/admin/banners', icon: ImageIcon },
  { nameKey: 'admin.aiAssistant', href: '/admin/ai-assistant', icon: Sparkles },
  { nameKey: 'admin.support', href: '/admin/support', icon: MessageSquare },
  { nameKey: 'admin.settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fix F5 redirect issue: wait for Zustand hydration
  useEffect(() => {
    // Sử dụng timeout ngắn để đảm bảo store đã rehydrate xong từ localStorage
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    // Nếu đã hydrate xong mà vẫn chưa có thông tin auth thì mới redirect
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      // Chỉ redirect nếu thực sự không phải admin (đợi 1 nhịp nữa cho chắc)
      const redirectTimer = setTimeout(() => {
        const authState = useAuthStore.getState();
        if (!authState.isAuthenticated) {
          router.replace('/login');
        } else if (authState.user?.role !== 'ADMIN') {
          router.replace('/');
        } else {
          setIsAuthorized(true);
        }
      }, 100);
      return () => clearTimeout(redirectTimer);
    } else {
      setIsAuthorized(true);
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchSupportCount = async () => {
      try {
        const res = await api.get('/support?status=OPEN');
        if (res.data.success) {
          setSupportCount(res.data.data.length);
        }
      } catch (err) {
        console.error('Failed to fetch support count', err);
      }
    };

    if (isAuthorized) {
      fetchSupportCount();
      const interval = setInterval(fetchSupportCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const currentLink = ADMIN_LINKS.find((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
  const currentTitle = currentLink ? t(currentLink.nameKey) : 'Dashboard';

  const renderNavLinks = (onNavigate?: () => void) => (
    ADMIN_LINKS.map((link) => {
      const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
      const name = t(link.nameKey);
      return (
        <Link
          key={link.nameKey}
          href={link.href}
          onClick={onNavigate}
          className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] transition-all text-sm font-medium ${
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <div className="flex min-w-0 items-center">
            <link.icon className="w-4.5 h-4.5 mr-2.5 shrink-0" />
            <span className="truncate">{name}</span>
          </div>
          {link.nameKey === 'admin.support' && supportCount > 0 && (
            <span className={`ml-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              isActive ? 'bg-white text-primary' : 'bg-primary text-white'
            }`}>
              {supportCount}
            </span>
          )}
        </Link>
      );
    })
  );

  if (!isAuthorized) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-[272px] border-r border-border bg-card/95 backdrop-blur flex-col hidden lg:flex sticky top-0 h-screen z-50">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center">
              <Bot className="text-primary-foreground w-4.5 h-4.5" />
            </div>
            <span className="font-bold tracking-tight text-foreground text-lg">{t('nav.admin')}</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {renderNavLinks()}
        </nav>

        <div className="p-3 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 rounded-[8px] text-sm font-medium text-danger hover:bg-danger/10 transition-all"
          >
            <LogOut className="w-4.5 h-4.5 mr-2.5" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu quản trị"
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative z-10 h-full w-[min(86vw,320px)] bg-card border-r border-border shadow-2xl flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center">
                  <Bot className="text-primary-foreground w-4.5 h-4.5" />
                </div>
                <span className="font-bold tracking-tight text-foreground text-lg">{t('nav.admin')}</span>
              </Link>
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-[8px] hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {renderNavLinks(() => setIsSidebarOpen(false))}
            </nav>
            <div className="p-3 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2.5 rounded-[8px] text-sm font-medium text-danger hover:bg-danger/10 transition-all"
              >
                <LogOut className="w-4.5 h-4.5 mr-2.5" />
                {t('admin.logout')}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative min-w-0">
        <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md flex items-center justify-between gap-3 px-4 sm:px-5 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Mở menu quản trị"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-[8px] hover:bg-secondary transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-base sm:text-lg text-foreground truncate">
              {currentTitle}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
             <div className="hidden sm:block">
               <LanguageSwitcher />
             </div>
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-[8px] hover:bg-secondary transition-colors">
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
             </button>
             <button className="p-2 rounded-[8px] hover:bg-secondary transition-colors relative">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
             </button>
             <div className="hidden sm:block w-px h-6 bg-border mx-1" />
             <div className="flex items-center space-x-2.5 cursor-pointer group">
               <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                 {user?.name?.charAt(0) || 'A'}
               </div>
               <span className="text-sm font-medium hidden sm:block text-foreground">{user?.name || 'Admin'}</span>
             </div>
          </div>
        </header>

        <div className="p-4 sm:p-5 lg:p-8 flex-1 bg-background min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
