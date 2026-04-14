'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight, 
  LayoutDashboard,
  AlertCircle
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Client-side protection
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Người dùng', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/50 border-r border-white/5 flex flex-col">
        <div className="p-8 border-b border-white/5">
           <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BarChart3 className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold gradient-text">UltraShop Admin</span>
           </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
           <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                 {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-slate-200 truncate">{user.name}</p>
                 <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{user.role}</p>
              </div>
           </div>
           <button 
             onClick={logout}
             className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
           >
             <LogOut className="w-5 h-5" />
             <span className="font-medium">Đăng xuất</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-slate-900/30 border-b border-white/5 flex items-center justify-between px-10">
           <h2 className="text-xl font-bold text-slate-200">
              {menuItems.find(i => i.href === pathname)?.name || 'Trang quản trị'}
           </h2>
           
           <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20 text-xs font-medium animate-pulse">
                 <AlertCircle className="w-4 h-4" />
                 <span>2 Sản phẩm sắp hết hàng</span>
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <button className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-emerald-400 transition-all">
                 <Settings className="w-5 h-5" />
              </button>
           </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           {children}
        </div>
      </main>
    </div>
  );
}
