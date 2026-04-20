'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';

// Mock data (trong thực tế sẽ lấy từ Zustand store hoặc API)
const initialCart = [
  {
    id: '1',
    name: 'Sleek Granite Chair',
    price: 3500000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267',
    variant: 'Gỗ sồi'
  },
  {
    id: '2',
    name: 'Hương thơm thiên nhiên',
    price: 1500000,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b',
    variant: 'Oải hương'
  }
];

export default function CartPage() {
  const [cart, setCart] = useState(initialCart);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: newQ > 0 ? newQ : 1 };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Giỏ hàng trống</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Chưa có sản phẩm nào trong giỏ hàng. Hãy để AI Assistant gợi ý cho bạn một vài lựa chọn thú vị nhé!
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/shop">
              <Button>Tiếp tục mua hàng</Button>
            </Link>
            <Link href="/ai-hub">
              <Button variant="outline"><Sparkles className="w-4 h-4 mr-2" /> Trợ lý AI</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Giỏ hàng của bạn</h1>
        <p className="text-muted-foreground">Có {cart.length} nhóm sản phẩm trong giỏ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-6">
          <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground pb-4 border-b border-border">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-3 text-center">Số lượng</div>
            <div className="col-span-3 text-right">Tạm tính</div>
          </div>

          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center group">
                {/* Info */}
                <div className="col-span-1 sm:col-span-6 flex gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted relative flex-shrink-0">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link href={`/product/${item.id}`} className="font-bold text-foreground hover:text-emerald-500 transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">Phân loại: {item.variant}</p>
                    <p className="text-emerald-500 font-bold mt-2 sm:hidden">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>

                {/* Controller */}
                <div className="col-span-1 sm:col-span-3 flex items-center sm:justify-center gap-4">
                  <div className="flex items-center bg-card border border-border rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:text-emerald-500 hover:bg-muted/10 rounded-lg transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-foreground">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:text-emerald-500 hover:bg-muted/10 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors sm:hidden">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Price & Delete */}
                <div className="hidden sm:flex col-span-3 items-center justify-end gap-6">
                  <span className="font-black text-foreground">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột Tính tiền */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-3xl border-border space-y-6 sticky top-32">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-4">Tổng quan đơn hàng</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính ({cart.length} item)</span>
                <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển chuẩn</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Thuế (VAT 10%)</span>
                <span>{(totalAmount * 0.1).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-end">
              <span className="font-bold text-foreground">Tổng cộng</span>
              <span className="text-2xl font-black text-emerald-500">{(totalAmount * 1.1).toLocaleString('vi-VN')}đ</span>
            </div>

            <Link href="/checkout" className="block w-full pt-4">
              <Button className="w-full py-6 text-lg font-bold rounded-2xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  Tiến hành thanh toán <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center justify-center">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-500" /> Được bảo vệ bởi Ultra AI Shield
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
