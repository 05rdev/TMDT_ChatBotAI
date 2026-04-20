'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Bot, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data || response.data;
      
      setAuth(user, accessToken, refreshToken);
      toast.success('Đăng nhập thành công', {
        description: `Chào mừng ${user.name} trở lại với UltraShop!`,
      });
      
      // Redirect based on role
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      toast.error('Đăng nhập thất bại', {
        description: err.response?.data?.message || 'Vui lòng kiểm tra lại email và mật khẩu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md solid-card p-10 bg-background shadow-[8px_8px_0px_0px_var(--foreground)] animate-slide-in-right">
        {/* Header */}
        <div className="text-center space-y-4 mb-10 border-b-4 border-foreground pb-6">
          <div className="w-20 h-20 bg-primary border-4 border-foreground flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_var(--foreground)]">
            <Bot className="text-primary-foreground w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">Chào mừng trở lại</h1>
          <p className="text-muted-foreground font-bold tracking-widest text-sm uppercase">Đăng nhập để vào hệ thống</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          
          <div className="space-y-2">
            <Input 
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="flex justify-end pt-2">
              <Link href="/forgot-password" size="sm" className="text-xs font-bold uppercase tracking-wider text-primary hover:text-foreground hover:underline transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            size="lg" 
            isLoading={isLoading}
            type="submit"
          >
            Đăng nhập
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center pt-6">
          <p className="text-foreground font-bold text-sm uppercase tracking-wider">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary hover:text-foreground underline underline-offset-4 inline-flex items-center ml-2 transition-colors">
              Đăng ký <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
