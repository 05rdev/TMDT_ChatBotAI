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
      <div className="w-full max-w-md card-elevated p-8 md:p-10 rounded-[var(--radius-xl)] animate-fade-in-up">
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-4">
            <Bot className="text-primary w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl tracking-tight text-foreground">Chào mừng trở lại</h1>
          <p className="text-muted-foreground text-sm">Đăng nhập để tiếp tục mua sắm</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input label="Email" type="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <div className="space-y-2">
            <Input label="Mật khẩu" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            <div className="flex justify-end pt-1">
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline transition-colors">Quên mật khẩu?</Link>
            </div>
          </div>
          <Button className="w-full mt-2" size="lg" isLoading={isLoading} type="submit">Đăng nhập</Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-border">
          <p className="text-muted-foreground text-sm">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Đăng ký <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
