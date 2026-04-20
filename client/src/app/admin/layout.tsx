'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Bot,
  Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const ADMIN_LINKS = [
  { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { name: 'Sản phẩm', href: '/admin/products', icon: PackageSearch },
  { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Khách hàng', href: '/admin/users', icon: Users },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is an ADMIN
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      setIsAuthorized(true);
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Prevent flashing the admin UI before auth check
  if (!isAuthorized) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-foreground border-t-primary rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Focus (Brutalist) */}
      <aside className="w-64 border-r-4 border-foreground bg-background flex flex-col hidden lg:flex sticky top-0 h-screen z-50">
        <div className="h-20 flex items-center px-6 border-b-4 border-foreground bg-accent">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-background border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
              <Bot className="text-foreground w-6 h-6" />
            </div>
            <span className="font-black tracking-tighter text-foreground uppercase text-xl">Ultra Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-4 bg-background">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center px-4 py-3 border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] -translate-y-1 translate-x-1' 
                    : 'border-transparent text-muted-foreground hover:border-foreground hover:bg-secondary hover:text-foreground hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:translate-x-1'
                }`}
              >
                <link.icon className={`w-5 h-5 mr-3`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t-4 border-foreground bg-secondary">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 border-2 border-transparent hover:border-foreground hover:bg-background text-sm font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-all hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:translate-x-1"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        {/* Top Header Admin */}
        <header className="h-20 border-b-4 border-foreground bg-background flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <h2 className="font-black text-2xl uppercase tracking-tighter text-foreground">
            {ADMIN_LINKS.find(l => pathname === l.href)?.name || 'Dashboard'}
          </h2>
          
          <div className="flex items-center space-x-6">
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <button className="p-2 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all flex relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary border-2 border-foreground" />
             </button>
             <div className="w-[2px] h-8 bg-foreground mx-2" />
             <div className="flex items-center space-x-3 cursor-pointer group">
               <div className="w-10 h-10 bg-accent border-2 border-foreground flex items-center justify-center text-foreground font-black group-hover:shadow-[2px_2px_0px_0px_var(--foreground)] group-hover:-translate-y-1 transition-all">
                 {user?.name?.charAt(0) || 'A'}
               </div>
               <span className="text-sm font-bold uppercase tracking-wider hidden sm:block text-foreground group-hover:text-primary transition-colors">{user?.name || 'Admin'}</span>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-10 flex-1 bg-background" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
