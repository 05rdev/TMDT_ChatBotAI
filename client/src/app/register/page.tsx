'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { Bot, User, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-card p-8 rounded-3xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="text-emerald-400 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</h1>
          <p className="text-slate-400 text-sm">Gia nhập cộng đồng UltraShop để tận hưởng đặc quyền AI</p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-2xl font-bold">✓</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-400">Đăng ký thành công!</h2>
            <p className="text-slate-400">Đang chuyển hướng bạn tới trang đăng nhập...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                name="name"
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input 
                name="email"
                label="Email"
                type="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                name="password"
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Input 
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <Button 
              className="w-full" 
              size="lg" 
              isLoading={isLoading}
              type="submit"
            >
              Đăng ký tài khoản
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/login" className="text-slate-400 hover:text-emerald-400 text-sm font-medium inline-flex items-center transition-colors">
            <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
