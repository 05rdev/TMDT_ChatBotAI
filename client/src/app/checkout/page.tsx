'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Truck, CreditCard, ChevronLeft, CheckCircle2, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedIds = searchParams.get('items')?.split(',') || [];
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();

  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'COD'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name || '' }));
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        const cartItems = res.data.data.items;
        // Lọc các item đã chọn
        const filteredItems = selectedIds.length > 0 
          ? cartItems.filter((item: any) => selectedIds.includes(item.id))
          : cartItems;
        
        // Kiểm tra xem có sản phẩm nào không khả dụng không
        const invalidItems = filteredItems.filter((item: any) => 
          (item.variant?.stock || 0) < item.quantity || 
          !item.product || 
          item.product.isActive === false || 
          item.product.isDeleted === true
        );

        if (invalidItems.length > 0) {
          const names = invalidItems.map((i: any) => i.product?.name).join(', ');
          toast.error(`Sản phẩm không khả dụng: ${names}. Vui lòng quay lại giỏ hàng để cập nhật.`);
        }

        setOrderItems(filteredItems);
        
        // Tính lại tổng tiền cho các món đã chọn
        const total = filteredItems.reduce((sum: number, item: any) => {
          return sum + (Number(item.variant?.price || 0) * item.quantity);
        }, 0);
        setSubtotal(total);
      }
    } catch (error) {
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string, discount: number } | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const discount = appliedVoucher ? appliedVoucher.discount : 0;
  const total = Math.max(0, subtotal - discount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return toast.error('Vui lòng nhập mã giảm giá');
    
    setIsApplyingVoucher(true);
    try {
      const categoryIds = Array.from(new Set(orderItems.map(item => item.product?.categoryId)));
      const res = await api.post('/vouchers/check', {
        code: voucherCode.trim().toUpperCase(),
        orderValue: subtotal,
        categoryIds
      });
      
      if (res.data.success) {
        setAppliedVoucher({
          code: res.data.data.voucher.code,
          discount: res.data.data.discountAmount
        });
        toast.success('Đã áp dụng mã giảm giá');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedVoucher(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return toast.error('Giỏ hàng trống');
    if (!formData.address || !formData.phone || !formData.name) return toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
    
    setIsProcessing(true);

    try {
      const payload = {
        address: formData.address,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        cartItemIds: selectedIds.length > 0 ? selectedIds : undefined
      };
      
      const res = await api.post('/orders', payload);
      if (res.data.success) {
        clearCart(); 
        const orderId = res.data.data.id;

        if (formData.paymentMethod === 'VNPAY') {
          try {
            const paymentRes = await api.post('/orders/checkout', {
              orderId,
              method: 'VNPAY'
            });
            if (paymentRes.data.success && paymentRes.data.data.payUrl) {
              window.location.href = paymentRes.data.data.payUrl;
              return;
            }
          } catch (paymentError) {
            toast.error('Lỗi khởi tạo thanh toán VNPAY, vui lòng thử lại sau');
          }
        }

        toast.success('Đặt hàng thành công!', {
          description: 'Đơn hàng của bạn đã được hệ thống ghi nhận. Cảm ơn bạn đã mua sắm trên UltraShop.',
        });
        
        await api.delete('/cart').catch(() => {});
        
        router.push(`/checkout/success?orderId=${orderId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in-up">
      <div className="flex items-center space-x-3 mb-2">
        <Link href="/cart">
          <Button variant="ghost" className="w-10 h-10 p-0 rounded-full hover:bg-secondary"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl text-foreground">Thanh toán</h1>
          <p className="text-muted-foreground text-sm mt-1">Vui lòng kiểm tra lại thông tin trước khi hoàn tất.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Checkout */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin giao hàng */}
          <section className="card-elevated p-6 sm:p-8 rounded-[var(--radius-xl)] bg-card">
            <h2 className="text-xl font-semibold border-b border-border pb-4 mb-6 flex items-center">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Thông tin giao hàng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Họ và tên người nhận" name="name" value={formData.name} onChange={handleChange} required />
              <Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} required />
              <div className="sm:col-span-2">
                <Input label="Địa chỉ giao hàng (Số nhà, Tên đường...)" name="address" value={formData.address} onChange={handleChange} required />
              </div>
            </div>
            <div className="bg-secondary/50 border border-border rounded-[var(--radius-lg)] p-4 flex items-start space-x-3 mt-6">
               <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
               <p className="text-sm text-muted-foreground leading-relaxed">Khoảng thời gian giao hàng dự kiến: <strong className="text-foreground font-semibold">1-2 ngày làm việc</strong> tại khu vực của bạn.</p>
            </div>
          </section>

          {/* Section 2: Phương thức thanh toán */}
          <section className="card-elevated p-6 sm:p-8 rounded-[var(--radius-xl)] bg-card">
            <h2 className="text-xl font-semibold border-b border-border pb-4 mb-6 flex items-center">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Phương thức thanh toán
            </h2>
            
            <div className="space-y-4">
              <label className={`block flex items-center p-4 border rounded-[var(--radius-lg)] cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-foreground/30 bg-card'}`}>
                <input type="radio" name="paymentOption" className="w-4.5 h-4.5 accent-primary" checked={formData.paymentMethod === 'COD'} onChange={() => setFormData({...formData, paymentMethod: 'COD'})} />
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-foreground">Thanh toán khi nhận hàng (COD)</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Kiểm tra hàng trước khi thanh toán bằng tiền mặt.</p>
                </div>
                <Truck className="w-6 h-6 text-primary opacity-80 hidden sm:block" />
              </label>

              <label className={`block flex items-center p-4 border rounded-[var(--radius-lg)] cursor-pointer transition-all ${formData.paymentMethod === 'VNPAY' ? 'border-accent bg-accent/5 shadow-sm' : 'border-border hover:border-foreground/30 bg-card'}`}>
                <input type="radio" name="paymentOption" className="w-4.5 h-4.5 accent-accent" checked={formData.paymentMethod === 'VNPAY'} onChange={() => setFormData({...formData, paymentMethod: 'VNPAY'})} />
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-foreground">Ví điện tử VNPAY</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Thanh toán qua mã QR ngay lập tức an toàn.</p>
                </div>
                <CreditCard className="w-6 h-6 text-accent opacity-80 hidden sm:block" />
              </label>
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card-elevated p-6 rounded-[var(--radius-xl)] bg-card space-y-6 sticky top-24">
            <h3 className="font-semibold text-lg text-foreground border-b border-border pb-4">Tóm tắt đơn hàng</h3>
            
            <div className="space-y-4 border-b border-border pb-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : orderItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Giỏ hàng trống</p>
              ) : (
                orderItems.map((item: any) => {
                  const image = item.product?.images?.[0]?.url || '';
                  const price = item.variant?.price ? Number(item.variant.price) : 0;
                  const isInvalid = !item.product || 
                                    item.product.isDeleted === true || 
                                    item.product.isActive === false || 
                                    (item.variant?.stock || 0) < item.quantity;
                  
                  return (
                    <div key={item.id} className={`flex items-center space-x-3 p-2 rounded-lg ${isInvalid ? 'bg-rose-50 border border-rose-100' : ''}`}>
                       <div className="w-14 h-14 rounded-[var(--radius-md)] bg-secondary relative overflow-hidden flex-shrink-0 border border-border">
                         {image ? <img src={image} alt="" className="object-cover w-full h-full" /> : <div className="w-full h-full bg-muted" />}
                         <div className="absolute top-0 right-0 w-4 h-4 bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center rounded-bl-[var(--radius-sm)]">{item.quantity}</div>
                         {isInvalid && (
                           <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                             <Info className="w-5 h-5 text-rose-600" />
                           </div>
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <h5 className={`text-sm font-semibold line-clamp-1 ${isInvalid ? 'text-rose-600' : 'text-foreground'}`}>{item.product?.name || 'Sản phẩm không tồn tại'}</h5>
                         <p className="text-xs text-muted-foreground mt-0.5">{price.toLocaleString('vi-VN')}đ</p>
                         {isInvalid && (
                           <p className="text-[10px] text-rose-500 font-bold uppercase mt-0.5">
                             {!item.product || item.product.isDeleted ? 'Sản phẩm không tồn tại' : item.product.isActive === false ? 'Ngừng kinh doanh' : 'Hết hàng'}
                           </p>
                         )}
                       </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span className="text-foreground font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển</span>
                <span className="text-primary font-medium">Miễn phí</span>
              </div>
              {appliedVoucher && (
               <div className="flex justify-between text-warning font-semibold">
                  <span>Mã giảm giá ({appliedVoucher.code})</span>
                  <span>-{appliedVoucher.discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>

            {/* Voucher Input */}
            <div className="pt-4 border-t border-border">
              {appliedVoucher ? (
                <div className="bg-warning/10 border border-warning/20 p-3 flex justify-between items-center rounded-[var(--radius-md)]">
                  <span className="text-warning font-semibold text-sm">Đã áp dụng: {appliedVoucher.code}</span>
                  <button onClick={removeVoucher} className="text-xs text-danger hover:underline font-medium">Gỡ bỏ</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nhập mã giảm giá..." 
                    value={voucherCode} 
                    onChange={(e) => setVoucherCode(e.target.value)} 
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleApplyVoucher} 
                    isLoading={isApplyingVoucher}
                    variant="secondary"
                  >
                    Áp dụng
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-5 flex justify-between items-end">
              <span className="font-semibold text-foreground">Tổng thanh toán</span>
              <span className="text-2xl font-bold text-primary">{total.toLocaleString('vi-VN')}đ</span>
            </div>

            <Button 
              onClick={handlePlaceOrder} 
              isLoading={isProcessing} 
              disabled={orderItems.some((item: any) => (item.variant?.stock || 0) < item.quantity || !item.product?.isActive)}
              size="lg" 
              className="w-full relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {orderItems.some((item: any) => (item.variant?.stock || 0) < item.quantity || !item.product?.isActive) 
                  ? 'Có sản phẩm lỗi' 
                  : <>Hoàn tất đặt hàng <CheckCircle2 className="ml-2 w-5 h-5" /></>}
              </span>
            </Button>

            <div className="pt-2">
              <p className="text-[11px] text-muted-foreground flex items-start leading-relaxed bg-secondary/30 p-3 rounded-[var(--radius-md)]">
                <ShieldCheck className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                Thông tin của bạn được mã hóa an toàn theo tiêu chuẩn bảo mật của UltraShop AI System.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
