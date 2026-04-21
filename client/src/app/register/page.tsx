'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { Bot, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (formData.password !== formData.confirmPassword) {
      toast.error('Lỗi xác nhận', { description: 'Mật khẩu xác nhận không khớp.' });
      setIsLoading(false);
      return;
    }
    try {
      await api.post('/auth/register', { name: formData.name, email: formData.email, password: formData.password });
      setSuccess(true);
      toast.success('Đăng ký thành công', { description: 'Tài khoản của bạn đã được tạo!' });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error('Đăng ký thất bại', { description: err.response?.data?.message || 'Vui lòng kiểm tra lại thông tin.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg card-elevated p-8 rounded-[var(--radius-xl)] animate-fade-in-up">
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-4">
            <Bot className="text-primary w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground">Tạo tài khoản mới</h1>
          <p className="text-muted-foreground text-sm">Gia nhập cộng đồng UltraShop để tận hưởng đặc quyền AI</p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto">
              <Check className="text-white w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-accent">Đăng ký thành công!</h2>
            <p className="text-muted-foreground">Đang chuyển hướng bạn tới trang đăng nhập...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="name" label="Họ và tên" placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} required />
              <Input name="email" label="Email" type="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="password" label="Mật khẩu" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              <Input name="confirmPassword" label="Xác nhận mật khẩu" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            <Button className="w-full" size="lg" isLoading={isLoading} type="submit">Đăng ký tài khoản</Button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-border pt-6">
          <Link href="/login" className="text-muted-foreground hover:text-primary text-sm font-medium inline-flex items-center transition-colors">
            <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
