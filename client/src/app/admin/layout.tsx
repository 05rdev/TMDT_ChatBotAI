'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, PackageSearch, ShoppingCart, Users, Settings, LogOut, Bot,
  Bell, MessageSquare, Tag, Sparkles, Moon, Sun, Image as ImageIcon
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
        if (!useAuthStore.getState().isAuthenticated || useAuthStore.getState().user?.role !== 'ADMIN') {
          router.push('/');
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
    router.push('/login');
  };

  if (!isAuthorized) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col hidden lg:flex sticky top-0 h-screen z-50">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 bg-primary rounded-[var(--radius-sm)] flex items-center justify-center">
              <Bot className="text-primary-foreground w-4.5 h-4.5" />
            </div>
            <span className="font-bold tracking-tight text-foreground text-lg">{t('nav.admin')}</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const name = t(link.nameKey);
            return (
              <Link 
                key={link.nameKey} 
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <link.icon className="w-4.5 h-4.5 mr-2.5" />
                  {name}
                </div>
                {link.nameKey === 'admin.support' && supportCount > 0 && (
                   <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                     isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                   }`}>
                     {supportCount}
                   </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-danger hover:bg-danger/10 transition-all"
          >
            <LogOut className="w-4.5 h-4.5 mr-2.5" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
          <h2 className="font-semibold text-lg text-foreground">
            {ADMIN_LINKS.find(l => pathname === l.href)?.nameKey ? t(ADMIN_LINKS.find(l => pathname === l.href)!.nameKey) : 'Dashboard'}
          </h2>
          
          <div className="flex items-center space-x-3">
             <LanguageSwitcher />
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors">
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
             </button>
             <button className="p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors relative">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
             </button>
             <div className="w-px h-6 bg-border mx-1" />
             <div className="flex items-center space-x-2.5 cursor-pointer group">
               <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                 {user?.name?.charAt(0) || 'A'}
               </div>
               <span className="text-sm font-medium hidden sm:block text-foreground">{user?.name || 'Admin'}</span>
             </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 flex-1 bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
