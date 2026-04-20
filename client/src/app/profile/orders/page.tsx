'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, XCircle, Search, ArrowRight, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-amber-500 text-white border-2 border-foreground font-black text-[10px] uppercase tracking-wider flex items-center shadow-[2px_2px_0px_0px_var(--foreground)]"><Clock className="w-3 h-3 mr-1" /> Chờ xác nhận</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 bg-blue-500 text-white border-2 border-foreground font-black text-[10px] uppercase tracking-wider flex items-center shadow-[2px_2px_0px_0px_var(--foreground)]"><Package className="w-3 h-3 mr-1" /> Đang chuẩn bị</span>;
      case 'DELIVERING':
        return <span className="px-3 py-1 bg-purple-500 text-white border-2 border-foreground font-black text-[10px] uppercase tracking-wider flex items-center shadow-[2px_2px_0px_0px_var(--foreground)]"><Clock className="w-3 h-3 mr-1" /> Đang giao</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-emerald-500 text-white border-2 border-foreground font-black text-[10px] uppercase tracking-wider flex items-center shadow-[2px_2px_0px_0px_var(--foreground)]"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã xong</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-500 text-white border-2 border-foreground font-black text-[10px] uppercase tracking-wider flex items-center shadow-[2px_2px_0px_0px_var(--foreground)]"><XCircle className="w-3 h-3 mr-1" /> Đã hủy</span>;
      default:
        return null;
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002'}/${url}`;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Sidebar Profile (Brutalist) */}
        <aside className="lg:col-span-1 hidden lg:block space-y-8">
           <div className="solid-card bg-background border-4 p-8 text-center space-y-6 shadow-[8px_8px_0px_0px_var(--foreground)]">
             <div className="w-24 h-24 bg-primary border-4 border-foreground rounded-none flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_var(--foreground)]">
                <User className="w-12 h-12 text-primary-foreground" />
             </div>
             <div>
               <h3 className="font-black text-xl uppercase tracking-tighter text-foreground">{user?.name || 'Thành viên'}</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2 px-3 py-1 bg-accent border-2 border-foreground inline-block">Hạng Vàng</p>
             </div>
           </div>

           <nav className="solid-card bg-background border-4 p-4 flex flex-col space-y-3 shadow-[8px_8px_0px_0px_var(--foreground)]">
             <Link href="/profile" className="px-5 py-4 border-2 border-transparent hover:border-foreground hover:bg-secondary transition-all font-black uppercase tracking-widest text-xs">
                Hồ sơ tài khoản
             </Link>
             <Link href="/profile/orders" className="px-5 py-4 border-4 border-foreground bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_var(--foreground)] -translate-y-1">
                Lịch sử đơn hàng
             </Link>
             <Link href="/profile/notifications" className="px-5 py-4 border-2 border-transparent hover:border-foreground hover:bg-secondary transition-all font-black uppercase tracking-widest text-xs">
                Thông báo
             </Link>
             <Link href="/profile/support" className="px-5 py-4 border-2 border-transparent hover:border-foreground hover:bg-secondary transition-all font-black uppercase tracking-widest text-xs">
                Trung tâm hỗ trợ
             </Link>
           </nav>
        </aside>

        {/* Main Area */}
        <div className="lg:col-span-3 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-4 border-foreground pb-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground">Đơn hàng của tôi</h1>
              <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Theo dõi quá trình vận chuyển và giao dịch.</p>
            </div>
            
            <div className="relative border-4 border-foreground bg-background flex items-center min-w-[300px] shadow-[4px_4px_0px_0px_var(--foreground)]">
              <Search className="w-5 h-5 text-muted-foreground ml-4" />
              <input 
                type="text" 
                placeholder="Tìm mã đơn hàng..." 
                className="w-full bg-transparent border-none focus:ring-0 text-sm px-4 py-3 font-bold text-foreground placeholder:text-muted-foreground uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-8">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-24 space-y-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="font-black uppercase tracking-widest animate-pulse">Đang tìm đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="solid-card bg-accent border-4 p-16 text-center space-y-8 shadow-[12px_12px_0px_0px_var(--foreground)]">
                <Package className="w-24 h-24 text-muted-foreground/30 mx-auto opacity-20" />
                <h3 className="text-3xl font-black uppercase tracking-tighter">Bạn chưa có đơn hàng nào</h3>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm max-w-md mx-auto">Khám phá ngay bộ sưu tập công nghệ mới nhất tại cửa hàng của chúng tôi.</p>
                <Link href="/shop" className="inline-block">
                  <Button className="h-16 px-10 text-lg shadow-[6px_6px_0px_0px_var(--foreground)]">Khám phá shop ngay</Button>
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="solid-card bg-background border-4 border-foreground overflow-hidden hover:shadow-[12px_12px_0px_0px_var(--foreground)] hover:-translate-y-1 transition-all shadow-[8px_8px_0px_0px_var(--foreground)]">
                  <div className="px-8 py-6 bg-accent border-b-4 border-foreground flex flex-wrap justify-between items-center gap-6">
                     <div className="space-y-1">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Mã giao dịch</span>
                       <h4 className="font-black text-foreground text-lg uppercase tracking-tighter">#{order.id.slice(0, 12)}...</h4>
                     </div>
                     <div className="hidden sm:block space-y-1">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ngày thanh toán</span>
                       <p className="font-bold text-sm text-foreground uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                     </div>
                     <div className="flex items-center gap-6">
                        {getStatusBadge(order.status)}
                     </div>
                  </div>

                  <div className="p-8">
                    <div className="space-y-6">
                      {order.items.map((item: any, index: number) => {
                        const image = getImageUrl(item.product.images?.[0]?.url);
                        return (
                          <div key={index} className="flex items-center space-x-6 group">
                             <div className="w-20 h-20 border-2 border-foreground overflow-hidden flex-shrink-0 shadow-[4px_4px_0px_0px_var(--foreground)] transition-transform group-hover:scale-105">
                                <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 space-y-1">
                                <h5 className="font-black text-foreground text-base uppercase tracking-tighter line-clamp-1">{item.product.name}</h5>
                                <div className="flex items-center space-x-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-secondary border border-foreground">{item.variant.name}</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SL: {item.quantity}</span>
                                </div>
                             </div>
                             <div className="text-right">
                               <p className="font-black text-lg text-foreground tracking-tighter">{Number(item.price).toLocaleString('vi-VN')}đ</p>
                             </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 pt-8 border-t-4 border-foreground border-dashed flex flex-col sm:flex-row justify-between items-center gap-8">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">Tổng cộng thanh toán</span>
                        <strong className="text-4xl font-black text-primary tracking-tighter">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</strong>
                      </div>
                      <div className="flex gap-4 w-full sm:w-auto">
                        <Link href={`/profile/orders/${order.id}`} className="flex-1 sm:flex-none">
                          <Button variant="outline" className="w-full h-14 px-8 font-black uppercase tracking-widest border-2 shadow-[4px_4px_0px_0px_var(--foreground)] active:shadow-none active:translate-y-[2px]">
                            Chi tiết
                          </Button>
                        </Link>
                        <Button className="flex-1 sm:flex-none h-14 px-10 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--foreground)] active:shadow-none active:translate-y-[2px]">
                          Mua lại <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
