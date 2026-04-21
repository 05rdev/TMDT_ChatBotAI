'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up">
      <div className="max-w-md w-full card-elevated p-10 rounded-[var(--radius-xl)] text-center relative overflow-hidden bg-card">
        {/* Soft Background Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="font-heading text-3xl text-foreground">
            Thanh toán thành công!
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Cảm ơn bạn đã mua sắm tại UltraShop. Đơn hàng của bạn đang được hệ thống xử lý nhanh chóng.
          </p>
          
          {orderId && (
            <div className="mt-6 p-4 bg-secondary/50 rounded-[var(--radius-lg)] border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Mã đơn hàng của bạn</p>
              <p className="font-mono text-primary font-semibold text-lg tracking-wide">{orderId}</p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Link href={`/profile/orders`} className="block">
              <Button size="lg" className="w-full group">
                Xem chi tiết đơn hàng
                <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" size="lg" className="w-full">
                <ShoppingBag className="w-4.5 h-4.5 mr-2" /> Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
