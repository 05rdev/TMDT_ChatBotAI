'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from './ui/Button';
import { ShoppingCart, User, Search, Menu, Bot, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="glass-nav px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Bot className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold gradient-text tracking-tight uppercase">UltraShop</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/shop" className="text-foreground/70 hover:text-emerald-500 font-medium transition-colors">
            Cửa hàng
          </Link>
          <Link href="/ai-hub" className="text-foreground/70 hover:text-emerald-500 font-medium transition-colors">
            AI Assistant
          </Link>
          <Link href="/about" className="text-foreground/70 hover:text-emerald-500 font-medium transition-colors">
            Giới thiệu
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-muted/10 rounded-full text-foreground/70 hover:text-emerald-500 transition-all active:scale-95"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          <button className="p-2 hover:bg-muted/10 rounded-full text-foreground/70 hover:text-emerald-500 transition-all">
            <Search className="w-5 h-5" />
          </button>
          
          <Link href="/cart" className="relative p-2 hover:bg-muted/10 rounded-full text-foreground/70 hover:text-emerald-500 transition-all">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 text-white text-[10px] flex items-center justify-center rounded-full">
              0
            </span>
          </Link>

          <div className="h-6 w-[1px] bg-border mx-2" />

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="flex items-center space-x-2 text-foreground/70 hover:text-emerald-500 transition-all">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>Đăng xuất</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          )}
          
          <button className="md:hidden p-2 hover:bg-muted/10 rounded-full text-foreground/70">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};
