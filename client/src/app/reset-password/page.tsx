'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error('Lien ket dat lai mat khau khong hop le');
      return;
    }

    if (password.length < 6) {
      toast.error('Mat khau phai co toi thieu 6 ky tu');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mat khau xac nhan khong khop');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success('Da dat lai mat khau', {
        description: 'Ban co the dang nhap bang mat khau moi.',
      });
      router.replace('/login');
    } catch (error: any) {
      toast.error('Khong the dat lai mat khau', {
        description: error.response?.data?.message || 'Lien ket co the da het han.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Mat khau moi"
        type="password"
        placeholder="Nhap mat khau moi"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        autoComplete="new-password"
      />
      <Input
        label="Xac nhan mat khau"
        type="password"
        placeholder="Nhap lai mat khau moi"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
        autoComplete="new-password"
      />
      <Button className="w-full" size="lg" isLoading={isLoading} type="submit" disabled={!token}>
        Dat lai mat khau
      </Button>
      {!token && (
        <p className="text-sm text-danger text-center">
          Lien ket dat lai mat khau thieu token. Vui long yeu cau gui lai email.
        </p>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md card-elevated p-8 md:p-10 rounded-[var(--radius-xl)] animate-fade-in-up">
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-4">
            <KeyRound className="text-primary w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl tracking-tight text-foreground">Dat lai mat khau</h1>
          <p className="text-muted-foreground text-sm">Tao mat khau moi cho tai khoan cua ban.</p>
        </div>

        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Dang tai...</p>}>
          <ResetPasswordForm />
        </Suspense>

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
