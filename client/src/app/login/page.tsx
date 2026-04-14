'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Bot, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data || response.data;
      
      setAuth(user, accessToken, refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
          <h1 className="text-2xl font-bold tracking-tight">Chào mừng trở lại!</h1>
          <p className="text-slate-400 text-sm">Đăng nhập để khám phá thế giới mua sắm AI</p>
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
              <Link href="/forgot-password" size="sm" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center animate-shake">
              {error}
            </div>
          )}

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
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center">
              Đăng ký ngay <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
