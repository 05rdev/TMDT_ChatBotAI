'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Focus (Bỏ Glassmorphism quá đà trong admin để nhường chỗ cho text rõ ràng) */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Bot className="text-white w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-foreground uppercase">Ultra Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-muted-foreground hover:bg-muted/10 hover:text-foreground'
                }`}
              >
                <link.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : ''}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button className="flex w-full items-center px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        {/* Top Header Admin */}
        <header className="h-16 glass-nav border-b border-border flex items-center justify-between px-6 lg:px-10">
          <h2 className="font-bold text-foreground capitalize">
            {ADMIN_LINKS.find(l => pathname === l.href)?.name || 'Dashboard'}
          </h2>
          
          <div className="flex items-center space-x-4">
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-muted-foreground hover:text-emerald-500 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <button className="p-2 text-muted-foreground hover:text-emerald-500 transition-colors flex relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
             </button>
             <div className="w-px h-6 bg-border mx-2" />
             <div className="flex items-center space-x-2">
               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/30">
                 {user?.name?.charAt(0) || 'A'}
               </div>
               <span className="text-sm font-medium hidden sm:block">{user?.name || 'Administrator'}</span>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
