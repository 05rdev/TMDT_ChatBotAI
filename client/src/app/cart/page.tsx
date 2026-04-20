'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Sparkles, Bot } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const totalAmount = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8">
        <div className="w-32 h-32 bg-accent border-4 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] flex items-center justify-center">
          <ShoppingCart className="w-16 h-16 text-foreground" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Giỏ hàng trống</h2>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm max-w-md mx-auto">
            Chưa có sản phẩm nào trong giỏ hàng. Hãy để AI Assistant gợi ý cho bạn một vài lựa chọn thú vị nhé!
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/shop">
            <Button size="lg" className="px-8 py-6 text-lg">Tiếp tục mua hàng</Button>
          </Link>
          <Link href="/ai-hub">
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg bg-accent">
              <Sparkles className="w-5 h-5 mr-2 text-primary" /> Trợ lý AI
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-foreground pb-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase text-foreground">Giỏ hàng</h1>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Có {items.length} nhóm sản phẩm đang chờ thanh toán</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Product List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-black uppercase tracking-widest text-foreground bg-accent p-4 border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] mb-6">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-3 text-center">Số lượng</div>
            <div className="col-span-3 text-right">Tạm tính</div>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="solid-card bg-background p-4 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Info */}
                <div className="col-span-1 sm:col-span-6 flex gap-4">
                  <div className="w-24 h-24 border-2 border-foreground bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    ) : (
                      <Bot className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link href={`/product/${item.productId}`} className="font-black text-lg uppercase tracking-tight text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {item.name}
                    </Link>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2 bg-accent inline-block w-max px-2 py-1 border border-foreground">
                      {item.variant}
                    </p>
                    <p className="text-primary font-black text-lg mt-2 sm:hidden">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>

                {/* Controller */}
                <div className="col-span-1 sm:col-span-3 flex items-center justify-between sm:justify-center">
                  <div className="flex items-center bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors border-r-2 border-foreground">
                      <Minus className="w-4 h-4 text-foreground" />
                    </button>
                    <span className="w-10 text-center font-black text-base">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors border-l-2 border-foreground">
                      <Plus className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 bg-accent border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground shadow-[2px_2px_0px_0px_var(--foreground)] transition-all sm:hidden">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Price & Delete */}
                <div className="hidden sm:flex col-span-3 items-center justify-end gap-6">
                  <span className="font-black text-xl text-foreground">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  <button onClick={() => removeItem(item.id)} className="p-2 bg-accent border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground shadow-[2px_2px_0px_0px_var(--foreground)] hover:-translate-y-1 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột Tính tiền */}
        <div className="lg:col-span-1">
          <div className="solid-card bg-accent p-6 space-y-6 sticky top-32">
            <h3 className="font-black text-2xl uppercase tracking-tighter text-foreground border-b-4 border-foreground pb-4">
              Tổng quan
            </h3>
            
            <div className="space-y-4 text-sm font-bold uppercase tracking-wider text-foreground">
              <div className="flex justify-between">
                <span>Tạm tính ({items.length} item)</span>
                <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển chuẩn</span>
                <span className="text-primary">Miễn phí</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế (VAT 10%)</span>
                <span>{(totalAmount * 0.1).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="border-t-4 border-foreground pt-6 flex justify-between items-end">
              <span className="font-black text-xl uppercase tracking-tighter text-foreground">Tổng cộng</span>
              <span className="text-3xl font-black text-primary">{(totalAmount * 1.1).toLocaleString('vi-VN')}đ</span>
            </div>

            <Link href="/checkout" className="block w-full pt-4">
              <Button className="w-full h-16 text-lg flex justify-between items-center px-6">
                <span>Tiến hành thanh toán</span>
                <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>

            <div className="pt-4 border-t-2 border-dashed border-foreground text-center">
              <p className="text-[10px] text-foreground uppercase tracking-widest font-black flex items-center justify-center bg-background py-2 border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                <Sparkles className="w-4 h-4 mr-2 text-primary" /> Được bảo vệ bởi Ultra AI Shield
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
