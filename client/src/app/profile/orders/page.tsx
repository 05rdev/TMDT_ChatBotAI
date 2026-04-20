'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, XCircle, Search, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock Data
const mockOrders = [
  {
    id: 'ORD-2026-9812A',
    date: '14/04/2026 18:30',
    total: 3850000,
    status: 'PROCESSING', // PENDING, PROCESSING, DELIVERING, COMPLETED, CANCELLED
    items: [
      { name: 'Sleek Granite Chair', quantity: 1, image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267' }
    ]
  },
  {
    id: 'ORD-2026-4421B',
    date: '10/04/2026 14:15',
    total: 1520000,
    status: 'COMPLETED',
    items: [
      { name: 'Smart AI Speaker Model X', quantity: 1, image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab' },
      { name: 'Led Light Strip 5M', quantity: 2, image: 'https://images.unsplash.com/photo-1550537687-c9a0c9700f5c' }
    ]
  }
];

export default function OrdersPage() {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold flex items-center"><Clock className="w-3 h-3 mr-1" /> Chờ xác nhận</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-xs font-bold flex items-center"><Package className="w-3 h-3 mr-1" /> Đang chuẩn bị</span>;
      case 'DELIVERING':
        return <span className="px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-xs font-bold flex items-center"><Clock className="w-3 h-3 mr-1" /> Đang giao hàng</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã giao xong</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold flex items-center"><XCircle className="w-3 h-3 mr-1" /> Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Profile */}
        <aside className="lg:col-span-1 hidden lg:block space-y-6">
           <div className="glass-card rounded-3xl p-6 text-center space-y-4">
             <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/50">
                <User className="w-10 h-10 text-muted-foreground" />
             </div>
             <div>
               <h3 className="font-bold text-foreground">Nguyễn Văn A</h3>
               <p className="text-sm text-muted-foreground mt-1">Thành viên Hạng Vàng</p>
             </div>
           </div>

           <nav className="glass-card rounded-3xl p-4 flex flex-col space-y-2">
             <Link href="/profile" className="px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted/10 transition-colors">
               Thông tin tài khoản
             </Link>
             <Link href="/profile/orders" className="px-4 py-3 rounded-xl text-sm font-bold text-emerald-500 bg-emerald-500/10 transition-colors">
               Lịch sử đơn hàng
             </Link>
             <Link href="/profile/wishlist" className="px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted/10 transition-colors">
               Sản phẩm yêu thích
             </Link>
           </nav>
        </aside>

        {/* Main Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Lịch sử đơn hàng</h1>
              <p className="text-muted-foreground text-sm mt-1">Theo dõi quá trình vận chuyển và quản lý các giao dịch.</p>
            </div>
            
            <div className="relative glass-card rounded-xl p-1 flex items-center overflow-hidden border-border min-w-[250px]">
              <Search className="w-4 h-4 text-muted-foreground ml-3" />
              <input 
                type="text" 
                placeholder="Tìm mã đơn hàng..." 
                className="w-full bg-transparent border-none focus:ring-0 text-sm px-3 py-2 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-6">
            {mockOrders.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center space-y-4">
                <Package className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                <h3 className="text-xl font-bold">Chưa có đơn hàng nào</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Bạn chưa thực hiện giao dịch nào. Hãy khám phá những món đồ công nghệ tuyệt vời trên UltraShop ngay.</p>
                <Link href="/shop"><Button className="mt-4">Khám phá cửa hàng</Button></Link>
              </div>
            ) : (
              mockOrders.map((order) => (
                <div key={order.id} className="glass-card rounded-3xl border-border overflow-hidden hover:border-emerald-500/30 transition-colors">
                  <div className="px-6 py-4 bg-muted/5 border-b border-border flex flex-wrap justify-between items-center gap-4">
                     <div>
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mã đơn hàng</span>
                       <h4 className="font-bold text-foreground">{order.id}</h4>
                     </div>
                     <div className="hidden sm:block">
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Thời gian đặt</span>
                       <p className="text-sm font-medium text-foreground">{order.date}</p>
                     </div>
                     <div className="flex items-center gap-4 border-l border-border pl-6">
                        {getStatusBadge(order.status)}
                     </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                           <div className="w-16 h-16 rounded-xl bg-muted/50 overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1">
                              <h5 className="font-bold text-foreground text-sm line-clamp-1">{item.name}</h5>
                              <p className="text-xs text-muted-foreground mt-1">x{item.quantity}</p>
                           </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-sm">
                        Tổng tiền: <strong className="text-xl text-emerald-500">{order.total.toLocaleString('vi-VN')}đ</strong>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Button variant="secondary" className="flex-1 sm:flex-none h-10">Liên hệ hỗ trợ</Button>
                        <Button className="flex-1 sm:flex-none h-10 px-6">Mua lại <ArrowRight className="w-4 h-4 ml-2" /></Button>
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
