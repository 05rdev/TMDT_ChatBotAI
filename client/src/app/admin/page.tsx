'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<number[]>([0,0,0,0,0,0,0]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, trendRes] = await Promise.all([
        api.get('/admin/stats/overview'),
        api.get('/admin/orders?limit=5'),
        api.get('/admin/stats/revenue-trend?type=day')
      ]);
      
      if (statsRes.data.success) {
        setStatsData(statsRes.data.data);
      }
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.orders);
      }
      if (trendRes.data.success) {
        // extract 'total' from array of {date, total}
        const values = trendRes.data.data.map((item: any) => item.total || 0);
        // keep last 7 items or pad
        if (values.length > 0) {
          setRevenueTrend(values.slice(-7));
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  };

  const MOCK_STATS = statsData ? [
    { label: 'Tổng doanh thu', value: `${statsData.revenue.toLocaleString('vi-VN')} ₫`, change: '+12.5%', isUp: true, icon: DollarSign },
    { label: 'Tổng đơn hàng', value: statsData.orders, change: '+5.2%', isUp: true, icon: ShoppingCart },
    { label: 'Khách hàng', value: statsData.users, change: '+3.1%', isUp: true, icon: Users },
    { label: 'Cảnh báo kho', value: statsData.lowStockAlert, change: 'Sắp hết hàng', isUp: false, icon: TrendingUp },
  ] : [
    { label: 'Tổng doanh thu', value: '0 ₫', change: '0%', isUp: true, icon: DollarSign },
    { label: 'Tổng đơn hàng', value: '0', change: '0%', isUp: true, icon: ShoppingCart },
    { label: 'Khách hàng', value: '0', change: '0%', isUp: true, icon: Users },
    { label: 'Cảnh báo kho', value: '0', change: '0%', isUp: false, icon: TrendingUp },
  ];

  return (
    <div className="space-y-12">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_STATS.map((stat, idx) => (
          <div key={idx} className="solid-card p-6 flex flex-col relative overflow-hidden bg-background hover:-translate-y-1 transition-transform cursor-default">
             <div className="flex items-center justify-between mb-8 relative z-10">
               <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</h4>
               <div className="w-10 h-10 border-2 border-foreground bg-accent flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
                 <stat.icon className="w-5 h-5 text-foreground" />
               </div>
             </div>
             <div className="relative z-10">
               <h2 className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</h2>
               <div className="flex items-center mt-4 text-sm font-bold bg-foreground text-background w-max px-2 py-1 border border-foreground">
                 {stat.isUp ? <ArrowUpRight className="w-4 h-4 mr-1 text-primary" /> : <ArrowDownRight className="w-4 h-4 mr-1 text-red-500" />}
                 {stat.change} <span className="opacity-70 font-normal ml-2 uppercase text-[10px]">Tháng trước</span>
               </div>
             </div>
             {/* Decorative Background Element */}
             <div className={`absolute -bottom-4 -right-4 w-24 h-24 border-4 border-foreground opacity-10 ${stat.isUp ? 'rotate-12' : '-rotate-12'}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart placeholder */}
        <div className="lg:col-span-2 solid-card p-8 bg-background flex flex-col">
           <div className="flex items-center justify-between mb-8 border-b-2 border-foreground pb-4">
             <h3 className="font-black text-xl uppercase tracking-tighter text-foreground">Biểu đồ doanh thu</h3>
             <select className="bg-background border-2 border-foreground font-bold text-sm px-4 py-2 outline-none uppercase tracking-wider cursor-pointer hover:bg-secondary transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]">
               <option>7 ngày qua</option>
               <option>30 ngày qua</option>
               <option>Năm nay</option>
             </select>
           </div>
           <div className="flex-1 bg-background border-2 border-dashed border-foreground p-6 flex items-end justify-between min-h-[300px] relative">
             {/* Y-axis labels */}
             <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between text-[10px] font-black text-muted-foreground">
               <span>50M</span>
               <span>25M</span>
               <span>0</span>
             </div>
             {/* Bars */}
              <div className="w-full h-full flex items-end justify-around pl-8">
                {revenueTrend.map((height, i) => {
                  const max = Math.max(...revenueTrend, 1);
                  const percentage = (height / max) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center group w-1/12 relative">
                      <div 
                        className="w-full bg-primary border-2 border-foreground transition-all duration-500 hover:bg-accent group-hover:-translate-y-2 relative" 
                        style={{ height: `${percentage}%`, boxShadow: '2px 2px 0px 0px var(--foreground)' }}
                      >
                        {/* Tooltip */}
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold py-1 px-2 whitespace-nowrap transition-opacity">
                          {height.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <span className="text-xs font-bold mt-4 uppercase text-foreground">N{i+1}</span>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-1 solid-card p-8 bg-background flex flex-col">
           <div className="flex items-center justify-between mb-8 border-b-2 border-foreground pb-4">
             <h3 className="font-black text-xl uppercase tracking-tighter text-foreground">Đơn hàng mới</h3>
             <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-foreground hover:underline underline-offset-4 transition-all">Xem tất cả</button>
           </div>
           <div className="space-y-4 flex-1">
             {recentOrders.map((order) => (
               <div key={order.id} className="flex justify-between items-center p-4 bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--primary)] transition-all cursor-pointer">
                  <div>
                    <h5 className="font-black text-xs text-foreground uppercase truncate max-w-[100px]">{order.id}</h5>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-1">{order.user?.name || 'Khách vãng lai'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-foreground">{Number(order.totalAmount).toLocaleString('vi-VN')}₫</p>
                    <div className={`text-[10px] font-bold mt-2 uppercase px-2 py-0.5 border border-foreground inline-block ${
                      order.status === 'DELIVERED' ? 'bg-primary text-primary-foreground' :
                      order.status === 'SHIPPED' ? 'bg-accent text-accent-foreground' :
                      order.status === 'PROCESSING' ? 'bg-foreground text-background' : 'bg-muted text-foreground'
                    }`}>
                      {order.status}
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
