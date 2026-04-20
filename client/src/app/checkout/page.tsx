'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Truck, CreditCard, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Mock Data
const orderItems = [
  { id: '1', name: 'Sleek Granite Chair', price: 3500000, quantity: 1, image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267' },
];

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường AI, Quận 1, TP. HCM',
    paymentMethod: 'COD'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const router = useRouter();
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Mô phỏng quá trình API xử lý (delay 2s)
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Đặt hàng thành công!', {
        description: 'Đơn hàng của bạn đã được hệ thống ghi nhận. Cảm ơn bạn đã mua sắm trên UltraShop.',
      });
      router.push('/profile/orders'); // Chuyển về trang theo dõi đơn
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/cart">
          <Button variant="ghost" className="w-10 h-10 p-0 rounded-full"><ChevronLeft className="w-6 h-6" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Thanh toán an toàn</h1>
          <p className="text-muted-foreground text-sm">Vui lòng kiểm tra lại thông tin trước khi hoàn tất.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Checkout */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Thông tin giao hàng */}
          <section className="glass-card p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mr-3 text-sm">1</span>
              Thông tin giao hàng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Họ và tên người nhận" name="name" value={formData.name} onChange={handleChange} required />
              <Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} required />
              <div className="sm:col-span-2">
                <Input label="Địa chỉ giao hàng (Số nhà, Tên đường...)" name="address" value={formData.address} onChange={handleChange} required />
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 mt-4">
               <Truck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-muted-foreground">Khoảng thời gian giao hàng dự kiến: <strong className="text-foreground">1-2 ngày làm việc</strong> tại khu vực của bạn.</p>
            </div>
          </section>

          {/* Section 2: Phương thức thanh toán */}
          <section className="glass-card p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mr-3 text-sm">2</span>
              Phương thức thanh toán
            </h2>
            
            <div className="space-y-4">
              <label className={`block flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-emerald-500/30'}`}>
                <input type="radio" name="paymentOption" className="w-5 h-5 accent-emerald-500" checked={formData.paymentMethod === 'COD'} onChange={() => setFormData({...formData, paymentMethod: 'COD'})} />
                <div className="ml-4 flex-1">
                  <h4 className="font-bold text-foreground">Thanh toán khi nhận hàng (COD)</h4>
                  <p className="text-sm text-muted-foreground">Kiểm tra hàng trước khi thanh toán tiền mặt.</p>
                </div>
                <Truck className="w-6 h-6 text-emerald-500 opacity-50" />
              </label>

              <label className={`block flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'VNPAY' ? 'border-cyan-500 bg-cyan-500/5' : 'border-border hover:border-cyan-500/30'}`}>
                <input type="radio" name="paymentOption" className="w-5 h-5 accent-cyan-500" checked={formData.paymentMethod === 'VNPAY'} onChange={() => setFormData({...formData, paymentMethod: 'VNPAY'})} />
                <div className="ml-4 flex-1">
                  <h4 className="font-bold text-foreground">Ví điện tử VNPAY (Demo)</h4>
                  <p className="text-sm text-muted-foreground">Thanh toán qua mã QR ngay lập tức.</p>
                </div>
                <CreditCard className="w-6 h-6 text-cyan-500 opacity-50" />
              </label>
            </div>
          </section>
        </div>

        {/* Cột Tổng kết & Place Order */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-3xl border-border space-y-6 sticky top-32">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-4">Tóm tắt đơn hàng</h3>
            
            {/* List Mini Item */}
            <div className="space-y-4 border-b border-border pb-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                   <div className="w-12 h-12 rounded-lg bg-muted relative overflow-hidden flex-shrink-0">
                     <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                     <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 text-[8px] font-bold text-white flex items-center justify-center rounded-bl-sm">{item.quantity}</div>
                   </div>
                   <div className="flex-1">
                     <h5 className="text-xs font-bold text-foreground line-clamp-1">{item.name}</h5>
                     <p className="text-xs text-muted-foreground">{item.price.toLocaleString('vi-VN')}đ</p>
                   </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Thuế (10%)</span>
                <span>{tax.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="border-t border-emerald-500/30 pt-4 flex justify-between items-end">
              <span className="font-bold text-foreground">Tổng thanh toán</span>
              <span className="text-2xl font-black text-emerald-500">{total.toLocaleString('vi-VN')}đ</span>
            </div>

            <Button onClick={handlePlaceOrder} isLoading={isProcessing} className="w-full py-6 text-lg font-bold rounded-2xl group relative overflow-hidden bg-emerald-500 hover:bg-emerald-600">
              <span className="relative z-10 flex items-center justify-center text-white">
                Hoàn tất đặt hàng <CheckCircle2 className="ml-2 w-5 h-5" />
              </span>
            </Button>

            <div className="pt-2">
              <p className="text-[10px] text-muted-foreground flex items-start">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                Thông tin của bạn được mã hóa an toàn theo tiêu chuẩn bảo mật của UltraShop AI System.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
