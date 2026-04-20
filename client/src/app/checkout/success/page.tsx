'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-card p-10 rounded-3xl shadow-xl border border-border relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Thanh toán thành công!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cảm ơn bạn đã mua sắm tại UltraShop. Đơn hàng của bạn đang được xử lý.
          </p>
          
          {orderId && (
            <div className="mt-6 p-4 bg-muted rounded-2xl border border-border">
              <p className="text-sm font-medium text-foreground">Mã đơn hàng của bạn:</p>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">{orderId}</p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Link href={`/profile/orders`} className="block">
              <Button className="w-full py-6 text-lg font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
                Xem chi tiết đơn hàng
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full py-6 text-lg font-bold rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 mr-2" /> Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
