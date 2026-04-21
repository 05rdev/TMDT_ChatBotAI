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
        return <span className="px-3 py-1 bg-warning/10 text-warning rounded-full font-semibold text-xs flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Chờ xác nhận</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 bg-accent/10 text-accent rounded-full font-semibold text-xs flex items-center"><Package className="w-3.5 h-3.5 mr-1" /> Đang chuẩn bị</span>;
      case 'DELIVERING':
        return <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold text-xs flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Đang giao</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-success/10 text-success rounded-full font-semibold text-xs flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã xong</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-danger/10 text-danger rounded-full font-semibold text-xs flex items-center"><XCircle className="w-3.5 h-3.5 mr-1" /> Đã hủy</span>;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Profile */}
        <aside className="lg:col-span-1 hidden lg:block space-y-6">
           <div className="card-elevated bg-card rounded-[var(--radius-xl)] p-6 text-center space-y-4">
             <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto overflow-hidden ring-4 ring-background shadow-sm">
                <User className="w-10 h-10 text-muted-foreground" />
             </div>
             <div>
               <h3 className="font-semibold text-lg text-foreground">{user?.name || 'Thành viên'}</h3>
               <p className="text-xs font-medium text-primary mt-1 bg-primary/10 px-3 py-1 rounded-full inline-block">Hạng Vàng</p>
             </div>
           </div>

           <nav className="card-elevated bg-card rounded-[var(--radius-xl)] p-3 flex flex-col space-y-1.5">
             <Link href="/profile" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                Hồ sơ tài khoản
             </Link>
             <Link href="/profile/orders" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-primary bg-primary/10 transition-colors">
                Lịch sử đơn hàng
             </Link>
             <Link href="/profile/notifications" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                Thông báo
             </Link>
             <Link href="/profile/support" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                Trung tâm hỗ trợ
             </Link>
           </nav>
        </aside>

        {/* Main Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div className="space-y-1.5">
              <h1 className="font-heading text-3xl text-foreground">Đơn hàng của tôi</h1>
              <p className="text-muted-foreground text-sm">Theo dõi quá trình vận chuyển và giao dịch.</p>
            </div>
            
            <div className="relative bg-card border border-border rounded-[var(--radius-lg)] flex items-center min-w-[280px] shadow-sm">
              <Search className="w-4.5 h-4.5 text-muted-foreground ml-3.5" />
              <input 
                type="text" 
                placeholder="Tìm mã đơn hàng..." 
                className="w-full bg-transparent border-none focus:ring-0 text-sm px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Đang tìm đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="card-elevated bg-card rounded-[var(--radius-xl)] p-12 text-center space-y-6">
                <Package className="w-20 h-20 text-muted opacity-50 mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl text-foreground">Bạn chưa có đơn hàng nào</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">Khám phá ngay bộ sưu tập công nghệ mới nhất tại cửa hàng của chúng tôi.</p>
                </div>
                <Link href="/shop" className="inline-block pt-4">
                  <Button size="lg" className="px-8">Khám phá shop ngay</Button>
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card-elevated bg-card border border-border rounded-[var(--radius-xl)] overflow-hidden hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="px-6 py-4 bg-secondary/30 border-b border-border flex flex-wrap justify-between items-center gap-4">
                     <div>
                       <span className="text-xs text-muted-foreground font-medium block mb-0.5">Mã giao dịch</span>
                       <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">#{order.id.slice(0, 10)}...</h4>
                     </div>
                     <div className="hidden sm:block">
                       <span className="text-xs text-muted-foreground font-medium block mb-0.5">Ngày đặt</span>
                       <p className="font-medium text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                     </div>
                     <div className="flex items-center">
                        {getStatusBadge(order.status)}
                     </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-5">
                      {order.items.map((item: any, index: number) => {
                        const image = getImageUrl(item.product.images?.[0]?.url);
                        return (
                          <div key={index} className="flex items-center space-x-4">
                             <div className="w-16 h-16 rounded-[var(--radius-md)] bg-secondary overflow-hidden flex-shrink-0 border border-border">
                                <img src={image} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-foreground text-sm line-clamp-1">{item.product.name}</h5>
                                <div className="flex items-center space-x-3 mt-1.5">
                                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{item.variant.name}</span>
                                  <span className="text-xs text-muted-foreground">SL: {item.quantity}</span>
                                </div>
                             </div>
                             <div className="text-right shrink-0">
                               <p className="font-semibold text-base text-foreground">{Number(item.price).toLocaleString('vi-VN')}đ</p>
                             </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Footer Actions */}
                    <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-5">
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block mb-1">Tổng cộng thanh toán</span>
                        <strong className="text-xl font-bold text-primary">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</strong>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Link href={`/profile/orders/${order.id}`} className="flex-1 sm:flex-none">
                          <Button variant="outline" className="w-full">
                            Chi tiết
                          </Button>
                        </Link>
                        <Button className="flex-1 sm:flex-none">
                          Mua lại <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
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
