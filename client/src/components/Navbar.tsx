'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { Button } from './ui/Button';
import { ShoppingCart, User, Search, Menu, Bot, Moon, Sun, Mic, Camera, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { NotificationBell } from './NotificationBell';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Translate } from './Translate';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Prevent hydration mismatch for cart badge
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    setCartCount(getTotalItems());
  }, [getTotalItems]);

  return (
    <nav className="solid-nav px-6 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-primary border-2 border-foreground flex items-center justify-center transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
               style={{ boxShadow: '3px 3px 0px 0px var(--foreground)' }}>
            <Bot className="text-primary-foreground w-7 h-7" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase text-foreground">
            Ultra<span className="text-primary">Shop</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/shop" className="text-foreground font-bold uppercase tracking-wider hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4">
            <Translate>Cửa hàng</Translate>
          </Link>
          <Link href="/about" className="text-foreground font-bold uppercase tracking-wider hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4">
            <Translate>Giới thiệu</Translate>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {/* Theme Toggle */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Search Bar in Header */}
          <div className="hidden lg:flex items-center bg-background border-2 border-foreground p-1 shadow-[2px_2px_0px_0px_var(--foreground)]">
            <div className="px-2 text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none focus:outline-none text-sm font-bold w-40 placeholder:font-normal"
            />
            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Tìm bằng giọng nói">
              <Mic className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Tìm bằng hình ảnh">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <button className="lg:hidden p-2.5 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all">
            <Search className="w-5 h-5" />
          </button>
          
          <Link href="/cart" className="relative p-2.5 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all">
            <ShoppingCart className="w-5 h-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary border-2 border-foreground text-primary-foreground text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <NotificationBell />

          <div className="h-8 w-[2px] bg-foreground mx-2" />

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="hidden lg:flex items-center px-4 py-2 bg-foreground text-background border-2 border-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-[2px_2px_0px_0px_var(--foreground)] active:shadow-none active:translate-y-[2px]">
                   Admin
                </Link>
              )}
              
              <Link href="/profile/support" className="p-2.5 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all" title="Hỗ trợ">
                <MessageSquare className="w-5 h-5" />
              </Link>

              <Link href="/profile" className="flex items-center space-x-2 text-foreground font-bold hover:text-primary transition-all">
                <User className="w-5 h-5" />
                <span className="text-sm uppercase tracking-wider hidden sm:inline">{user?.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>Đăng xuất</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          )}
          
          <button className="md:hidden p-2.5 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};
