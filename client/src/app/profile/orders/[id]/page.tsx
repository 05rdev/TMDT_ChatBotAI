'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Truck, 
  MapPin, 
  CreditCard, 
  Phone, 
  Calendar,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    images: { url: string }[];
  };
  variant: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  address: string;
  phone: string;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    method: string;
    status: string;
    amount: number;
  };
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      toast.error('Không tìm thấy đơn hàng');
      router.push('/profile/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: <Clock />, label: 'Chờ xác nhận', color: 'bg-amber-500', step: 1 };
      case 'PROCESSING':
        return { icon: <Zap />, label: 'Đang xử lý', color: 'bg-blue-500', step: 2 };
      case 'DELIVERING':
        return { icon: <Truck />, label: 'Đang giao hàng', color: 'bg-purple-500', step: 3 };
      case 'COMPLETED':
        return { icon: <CheckCircle2 />, label: 'Hoàn thành', color: 'bg-emerald-500', step: 4 };
      case 'CANCELLED':
        return { icon: <XCircle />, label: 'Đã hủy', color: 'bg-red-500', step: 0 };
      default:
        return { icon: <Clock />, label: 'Không rõ', color: 'bg-gray-500', step: 1 };
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002'}/${url}`;
  };

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
      <p className="font-black uppercase tracking-widest animate-pulse">Đang truy xuất thông tin đơn hàng...</p>
    </div>
  );

  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);
  const steps = [
    { label: 'Đặt đơn', icon: Calendar },
    { label: 'Xác nhận', icon: ShieldCheck },
    { label: 'Giao hàng', icon: Truck },
    { label: 'Hoàn tất', icon: CheckCircle2 }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-foreground pb-8">
        <div className="space-y-4">
          <Link href="/profile/orders" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Quay lại lịch sử
          </Link>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground">
            Chi tiết đơn hàng
          </h1>
          <div className="flex items-center space-x-3">
             <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Mã đơn: #{order.id.toUpperCase()}</span>
             <div className={`${statusInfo.color} text-white px-3 py-1 border-2 border-foreground font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_var(--foreground)]`}>
                {statusInfo.label}
             </div>
          </div>
        </div>
        
        <Button variant="outline" className="h-14 px-8 border-2 shadow-[4px_4px_0px_0px_var(--foreground)] active:shadow-none active:translate-y-[2px]">
          Xuất hóa đơn (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Order Tracker */}
          <div className="solid-card bg-accent border-4 border-foreground p-10 shadow-[8px_8px_0px_0px_var(--foreground)]">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-10 flex items-center">
              Trạng thái vận chuyển <Truck className="ml-3 w-6 h-6" />
            </h3>
            
            <div className="relative flex justify-between items-start">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-foreground/10 z-0">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${order.status === 'CANCELLED' ? 0 : (statusInfo.step / 4) * 100}%` }} 
                />
              </div>

              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = statusInfo.step >= stepNum && order.status !== 'CANCELLED';
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-3 w-1/4">
                    <div className={`w-12 h-12 border-4 border-foreground flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_var(--foreground)] scale-110' : 'bg-background text-muted-foreground'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {order.status === 'CANCELLED' && (
              <div className="mt-10 p-4 bg-red-500/10 border-2 border-red-500 text-red-500 font-bold text-center uppercase tracking-widest text-xs">
                Đơn hàng này đã bị hủy.
              </div>
            )}
          </div>

          {/* Items */}
          <div className="solid-card bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_var(--foreground)]">
            <div className="p-6 border-b-4 border-foreground bg-secondary">
              <h3 className="text-lg font-black uppercase tracking-tighter">Sản phẩm ({order.items.length})</h3>
            </div>
            <div className="divide-y-4 divide-foreground">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 flex items-center space-x-6">
                  <div className="w-24 h-24 border-2 border-foreground overflow-hidden flex-shrink-0 shadow-[4px_4px_0px_0px_var(--foreground)]">
                    <img src={getImageUrl(item.product.images[0]?.url)} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-black text-lg uppercase tracking-tighter line-clamp-1">{item.product.name}</h4>
                    <span className="inline-block px-2 py-0.5 border border-foreground bg-accent text-[10px] font-black uppercase tracking-widest">{item.variant.name}</span>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl tracking-tighter">{Number(item.price).toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-10 bg-accent border-t-4 border-foreground space-y-4 text-right">
               <div className="flex justify-end items-center space-x-10">
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tạm tính:</span>
                 <span className="text-xl font-black">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</span>
               </div>
               <div className="flex justify-end items-center space-x-10">
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phí vận chuyển:</span>
                 <span className="text-xl font-black">Miễn phí</span>
               </div>
               <div className="flex justify-end items-center space-x-10 pt-4 border-t-2 border-foreground border-dashed">
                 <span className="text-sm font-black uppercase tracking-widest">Tổng cộng:</span>
                 <span className="text-4xl font-black text-primary tracking-tighter">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Info */}
        <div className="space-y-8">
          {/* Address */}
          <div className="solid-card bg-background border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--foreground)]">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-primary" /> Thông tin nhận hàng
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Địa chỉ giao hàng</p>
                <p className="font-bold text-sm leading-relaxed">{order.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Số điện thoại</p>
                <p className="font-bold text-sm flex items-center"><Phone className="w-3 h-3 mr-2" /> {order.phone}</p>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="solid-card bg-background border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--foreground)]">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-primary" /> Phương thức thanh toán
            </h3>
            <div className="space-y-4">
              <div className="bg-accent border-2 border-foreground p-4 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest">{order.payment?.method || 'VNPAY'}</span>
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase border border-foreground">Đã thanh toán</span>
              </div>
              <div className="text-[10px] font-bold text-muted-foreground italic leading-relaxed">
                Giao dịch được bảo mật bởi hệ thống UltraShop Security.
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={() => router.push('/profile/support')} className="w-full h-16 font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_var(--foreground)]">
              Yêu cầu hỗ trợ đơn hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
