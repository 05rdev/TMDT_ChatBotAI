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
import api from '@/lib/api';

const ADMIN_LINKS = [
  { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { name: 'Sản phẩm', href: '/admin/products', icon: PackageSearch },
  { name: 'Danh mục', href: '/admin/categories', icon: Tag },
  { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Khách hàng', href: '/admin/users', icon: Users },
  { name: 'Khuyến mãi', href: '/admin/vouchers', icon: Tag },
  { name: 'Banner', href: '/admin/banners', icon: ImageIcon },
  { name: 'AI Assistant', href: '/admin/ai-assistant', icon: Sparkles },
  { name: 'Hỗ trợ', href: '/admin/support', icon: MessageSquare },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [supportCount, setSupportCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      setIsAuthorized(true);
    }
  }, [isAuthenticated, user, router]);

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
            <span className="font-bold tracking-tight text-foreground text-lg">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <link.icon className="w-4.5 h-4.5 mr-2.5" />
                  {link.name}
                </div>
                {link.name === 'Hỗ trợ' && supportCount > 0 && (
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
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
          <h2 className="font-semibold text-lg text-foreground">
            {ADMIN_LINKS.find(l => pathname === l.href)?.name || 'Dashboard'}
          </h2>
          
          <div className="flex items-center space-x-3">
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
