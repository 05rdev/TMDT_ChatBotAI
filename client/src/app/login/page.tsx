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
      router.push('/');
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
      <div className="w-full max-w-md glass-card p-8 rounded-3xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Bot className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Chào mừng trở lại!</h1>
          <p className="text-muted-foreground text-sm">Đăng nhập để tiếp tục trải nghiệm UltraShop</p>
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
          
          <div className="space-y-1">
            <Input 
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="flex justify-end px-1">
              <Link href="/forgot-password" size="sm" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            isLoading={isLoading}
            type="submit"
          >
            Đăng nhập
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-border pt-6">
          <p className="text-muted-foreground text-sm">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-bold inline-flex items-center">
              Đăng ký ngay <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
