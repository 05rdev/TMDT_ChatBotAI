'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Da gui huong dan dat lai mat khau', {
        description: 'Vui long kiem tra hop thu email cua ban.',
      });
    } catch (error: any) {
      toast.error('Khong the gui email', {
        description: error.response?.data?.message || 'Vui long thu lai sau.',
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
            <Mail className="text-primary w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl tracking-tight text-foreground">Quen mat khau</h1>
          <p className="text-muted-foreground text-sm">
            Nhap email tai khoan, he thong se gui lien ket dat lai mat khau.
          </p>
        </div>

        {sent ? (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-md)] border border-primary/25 bg-primary/10 p-4 text-sm text-foreground">
              Neu email ton tai trong he thong, ban se nhan duoc lien ket dat lai mat khau trong it phut.
            </div>
            <Button className="w-full" size="lg" type="button" onClick={() => setSent(false)}>
              Gui lai email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
            <Button className="w-full" size="lg" isLoading={isLoading} type="submit">
              Gui email dat lai mat khau
            </Button>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-border">
          <Link href="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1 text-sm">
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lai dang nhap
          </Link>
        </div>
      </div>
    </div>
  );
}
