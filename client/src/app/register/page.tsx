'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/lib/api';
import { Bot, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('register.passwordMismatch'), { description: t('register.passwordMismatchDesc') });
      setIsLoading(false);
      return;
    }
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });
      setSuccess(true);
      toast.success(t('register.success'), { description: t('register.successDesc') });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(t('register.failed'), { description: err.response?.data?.message || t('register.failedDesc') });
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
          <h1 className="font-heading text-2xl tracking-tight text-foreground">{t('register.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('register.subtitle')}</p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto">
              <Check className="text-white w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-accent">{t('register.success')}!</h2>
            <p className="text-muted-foreground">{t('register.redirecting')}</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="name" label={t('register.fullName')} placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} required />
              <Input name="email" label={t('register.email')} type="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="phone" label={t('register.phone')} type="tel" placeholder="0901234567" value={formData.phone} onChange={handleChange} required />
              <Input name="address" label={t('register.address')} placeholder="12 Nguyen Van Bao, Go Vap" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="password" label={t('register.password')} type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              <Input name="confirmPassword" label={t('register.confirmPassword')} type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            <Button className="w-full" size="lg" isLoading={isLoading} type="submit">{t('register.submitBtn')}</Button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-border pt-6">
          <Link href="/login" className="text-muted-foreground hover:text-primary text-sm font-medium inline-flex items-center transition-colors">
            <ArrowLeft className="mr-2 w-4 h-4" /> {t('register.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
