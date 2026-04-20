'use client';

import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const MOCK_STATS = [
  { label: 'Tổng doanh thu', value: '45.2M ₫', change: '+12.5%', isUp: true, icon: DollarSign },
  { label: 'Đơn hàng mới', value: '156', change: '+5.2%', isUp: true, icon: ShoppingCart },
  { label: 'Khách hàng', value: '2,405', change: '+3.1%', isUp: true, icon: Users },
  { label: 'Tỉ lệ chuyển đổi', value: '4.8%', change: '-0.4%', isUp: false, icon: TrendingUp },
];

const RECENT_ORDERS = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', amount: 3500000, status: 'DELIVERING' },
  { id: 'ORD-002', customer: 'Trần Thị B', amount: 1200000, status: 'PENDING' },
  { id: 'ORD-003', customer: 'Lê Văn C', amount: 890000, status: 'COMPLETED' },
  { id: 'ORD-004', customer: 'Phạm Thị D', amount: 4500000, status: 'PROCESSING' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_STATS.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border-border flex flex-col relative overflow-hidden">
             <div className="flex items-center justify-between mb-4 relative z-10">
               <h4 className="text-sm font-medium text-muted-foreground">{stat.label}</h4>
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <stat.icon className="w-5 h-5 text-primary" />
               </div>
             </div>
             <div className="relative z-10">
               <h2 className="text-3xl font-bold text-foreground">{stat.value}</h2>
               <div className={`flex items-center mt-2 text-sm font-bold ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                 {stat.isUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                 {stat.change} <span className="text-muted-foreground font-normal ml-2">so với tháng trước</span>
               </div>
             </div>
             {/* Decorative Background Blob */}
             <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${stat.isUp ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart placeholder */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border-border h-96 flex flex-col">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Biểu đồ doanh thu</h3>
             <select className="bg-background border border-border rounded-lg text-sm px-3 py-1.5 outline-none">
               <option>7 ngày qua</option>
               <option>30 ngày qua</option>
               <option>Năm nay</option>
             </select>
           </div>
           <div className="flex-1 bg-muted/20 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-sm">
             [Line Chart Rendering Area - Requires Chart.js / Recharts]
           </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-1 glass-card rounded-3xl p-6 border-border flex flex-col">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Đơn hàng mới đây</h3>
             <button className="text-sm text-emerald-500 hover:underline">Xem tất cả</button>
           </div>
           <div className="space-y-4 flex-1">
             {RECENT_ORDERS.map((order) => (
               <div key={order.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-muted/10 transition-colors border border-transparent hover:border-border cursor-pointer">
                  <div>
                    <h5 className="font-bold text-sm text-foreground">{order.id}</h5>
                    <p className="text-xs text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">{order.amount.toLocaleString('vi-VN')}₫</p>
                    <p className={`text-[10px] font-bold mt-1 uppercase ${
                      order.status === 'COMPLETED' ? 'text-emerald-500' :
                      order.status === 'DELIVERING' ? 'text-purple-500' :
                      order.status === 'PROCESSING' ? 'text-blue-500' : 'text-amber-500'
                    }`}>{order.status}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
