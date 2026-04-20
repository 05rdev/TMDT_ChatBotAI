'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { XCircle, RefreshCcw } from 'lucide-react';

export default function CheckoutFailedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-card p-10 rounded-3xl shadow-xl border border-destructive/20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-destructive/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-destructive/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-destructive/10 mb-6">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Thanh toán thất bại
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Rất tiếc, quá trình thanh toán của bạn không thành công hoặc đã bị hủy. Vui lòng thử lại.
          </p>
          
          {orderId && (
            <div className="mt-6 p-4 bg-muted rounded-2xl border border-border">
              <p className="text-sm font-medium text-foreground">Mã đơn hàng:</p>
              <p className="font-mono text-destructive font-bold mt-1">{orderId}</p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Link href={`/profile/orders`} className="block">
              <Button className="w-full py-6 text-lg font-bold rounded-xl bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center">
                <RefreshCcw className="w-5 h-5 mr-2" /> Thử thanh toán lại
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full py-6 text-lg font-bold rounded-xl">
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
