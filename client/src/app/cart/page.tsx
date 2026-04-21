'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Sparkles, Bot, Loader2, Info } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CartPage() {
  const localCart = useCartStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [serverCart, setServerCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverTotal, setServerTotal] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (user) {
      fetchServerCart();
    }
  }, [user]);

  const fetchServerCart = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setServerCart(res.data.data.items);
        setServerTotal(res.data.data.totalAmount);
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, variantId: string, currentQty: number, change: number) => {
    const newQty = Math.max(1, currentQty + change);
    if (user) {
      try {
        await api.put(`/cart/${variantId}`, { quantity: newQty });
        fetchServerCart();
      } catch (error) {
        toast.error('Cập nhật số lượng thất bại');
      }
    } else {
      localCart.updateQuantity(id, newQty);
    }
  };

  const removeItem = async (id: string, variantId: string) => {
    if (user) {
      try {
        await api.delete(`/cart/${variantId}`);
        fetchServerCart();
      } catch (error) {
        toast.error('Xóa sản phẩm thất bại');
      }
    } else {
      localCart.removeItem(id);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  // Auth Guard: yêu cầu đăng nhập khi chưa login
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md card-elevated rounded-[var(--radius-xl)] p-10 text-center space-y-6 animate-fade-in-up">
          <div className="w-20 h-20 bg-secondary rounded-[var(--radius-lg)] flex items-center justify-center mx-auto">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-3xl text-foreground">Vui lòng đăng nhập</h2>
            <p className="text-muted-foreground text-sm">
              Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Link href="/login" className="w-full">
              <Button size="lg" className="w-full">Đăng nhập ngay</Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button size="lg" variant="outline" className="w-full">Đăng ký</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = user ? serverCart.map(item => ({
    id: item.id,
    productId: item.productId,
    productVariantId: item.productVariantId,
    name: item.product?.name,
    price: item.variant?.price || 0,
    quantity: item.quantity,
    image: item.product?.images?.[0]?.url,
    variant: item.variant?.name
  })) : localCart.items;

  const totalAmount = user ? serverTotal : localCart.getTotalPrice();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg card-elevated p-12 rounded-[var(--radius-xl)] text-center space-y-6 animate-fade-in-up">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="font-heading text-3xl text-foreground">Giỏ hàng trống</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
              Chưa có sản phẩm nào trong giỏ hàng. Hãy để AI Assistant gợi ý cho bạn một vài lựa chọn thú vị nhé!
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-6">
            <Link href="/shop">
              <Button size="lg">Tiếp tục mua hàng</Button>
            </Link>
            <Link href="/ai-hub">
              <Button size="lg" variant="outline" className="gap-2">
                <Sparkles className="w-4.5 h-4.5 text-primary" /> Trợ lý AI
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl tracking-tight text-foreground">Giỏ hàng</h1>
          <p className="text-muted-foreground text-sm font-medium">Có {items.length} sản phẩm đang chờ thanh toán</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Product List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground bg-secondary px-6 py-3 rounded-[var(--radius-lg)]">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-3 text-center">Số lượng</div>
            <div className="col-span-3 text-right">Tạm tính</div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card-elevated bg-card p-4 sm:p-5 rounded-[var(--radius-lg)] grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Info */}
                <div className="col-span-1 sm:col-span-6 flex gap-4">
                  <Link href={`/product/${item.productId}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-secondary rounded-[var(--radius-md)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Bot className="w-8 h-8 text-muted" />
                    )}
                  </Link>
                  <div className="flex flex-col justify-center min-w-0">
                    <Link href={`/product/${item.productId}`} className="font-semibold text-base text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {item.name}
                    </Link>
                    <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full mt-2 inline-block w-max">
                      {item.variant}
                    </span>
                    <p className="text-primary font-bold mt-2 sm:hidden">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>

                {/* Controller */}
                <div className="col-span-1 sm:col-span-3 flex items-center justify-between sm:justify-center">
                  <div className="flex items-center bg-secondary rounded-[var(--radius-md)] p-1">
                    <button onClick={() => updateQuantity(item.id, item.productVariantId || '', item.quantity, -1)} className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] bg-card text-foreground hover:text-primary transition-colors shadow-sm">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.productVariantId || '', item.quantity, 1)} className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] bg-card text-foreground hover:text-primary transition-colors shadow-sm">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id, item.productVariantId || '')} className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-[var(--radius-sm)] transition-all sm:hidden">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Price & Delete */}
                <div className="hidden sm:flex col-span-3 items-center justify-end gap-4">
                  <span className="font-semibold text-lg text-foreground">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  <button onClick={() => removeItem(item.id, item.productVariantId || '')} className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-[var(--radius-md)] transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card-elevated bg-card p-6 rounded-[var(--radius-xl)] space-y-6 sticky top-24">
            <h3 className="font-semibold text-lg text-foreground border-b border-border pb-4">
              Tóm tắt đơn hàng
            </h3>
            
            <div className="space-y-3.5 text-sm font-medium text-foreground">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính ({items.length} sp)</span>
                <span className="text-foreground">{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển</span>
                <span className="text-primary font-semibold">Miễn phí</span>
              </div>
            </div>

            <div className="border-t border-border pt-5 flex justify-between items-end">
              <span className="font-semibold text-foreground">Tổng cộng</span>
              <span className="text-2xl font-bold text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="pt-2">
              <Link href="/checkout" className="block w-full">
                <Button size="lg" className="w-full flex justify-between items-center px-6">
                  <span>Tiến hành thanh toán</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-border flex items-start gap-3 bg-secondary/50 p-4 rounded-[var(--radius-md)]">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đơn hàng được áp dụng chính sách đổi trả miễn phí trong vòng 30 ngày và bảo vệ bởi <span className="font-semibold text-foreground">UltraShop Guarantee</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
