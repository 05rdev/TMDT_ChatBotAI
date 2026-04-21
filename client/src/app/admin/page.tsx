'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
      if (statsRes.data.success) setStatsData(statsRes.data.data);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.orders);
      if (trendRes.data.success) {
        const values = trendRes.data.data.map((item: any) => item.total || 0);
        if (values.length > 0) setRevenueTrend(values.slice(-7));
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  };

  const stats = statsData ? [
    { label: 'Tổng doanh thu', value: `${statsData.revenue.toLocaleString('vi-VN')} ₫`, change: '+12.5%', isUp: true, icon: DollarSign, color: 'bg-primary/10 text-primary' },
    { label: 'Tổng đơn hàng', value: statsData.orders, change: '+5.2%', isUp: true, icon: ShoppingCart, color: 'bg-accent/10 text-accent' },
    { label: 'Khách hàng', value: statsData.users, change: '+3.1%', isUp: true, icon: Users, color: 'bg-warning/10 text-warning' },
    { label: 'Cảnh báo kho', value: statsData.lowStockAlert, change: 'Sắp hết hàng', isUp: false, icon: TrendingUp, color: 'bg-danger/10 text-danger' },
  ] : [
    { label: 'Tổng doanh thu', value: '0 ₫', change: '0%', isUp: true, icon: DollarSign, color: 'bg-primary/10 text-primary' },
    { label: 'Tổng đơn hàng', value: '0', change: '0%', isUp: true, icon: ShoppingCart, color: 'bg-accent/10 text-accent' },
    { label: 'Khách hàng', value: '0', change: '0%', isUp: true, icon: Users, color: 'bg-warning/10 text-warning' },
    { label: 'Cảnh báo kho', value: '0', change: '0%', isUp: false, icon: TrendingUp, color: 'bg-danger/10 text-danger' },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="card-elevated p-5 flex flex-col hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between mb-4">
               <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
               <div className={`w-9 h-9 ${stat.color} rounded-[var(--radius-md)] flex items-center justify-center`}>
                 <stat.icon className="w-4.5 h-4.5" />
               </div>
             </div>
             <h2 className="text-2xl font-bold text-foreground">{stat.value}</h2>
             <div className="flex items-center mt-2 text-xs font-medium">
               {stat.isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-accent" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1 text-danger" />}
               <span className={stat.isUp ? 'text-accent' : 'text-danger'}>{stat.change}</span>
               <span className="text-muted-foreground ml-1.5">vs tháng trước</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card-elevated p-6 flex flex-col">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-semibold text-foreground">Biểu đồ doanh thu</h3>
             <select className="bg-secondary border border-border rounded-[var(--radius-md)] text-sm px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-primary/25">
               <option>7 ngày qua</option>
               <option>30 ngày qua</option>
               <option>Năm nay</option>
             </select>
           </div>
           <div className="flex-1 border border-border rounded-[var(--radius-md)] p-4 flex items-end justify-between min-h-[280px] relative bg-secondary/30">
             <div className="absolute left-2 top-3 bottom-6 flex flex-col justify-between text-[10px] font-medium text-muted-foreground">
               <span>50M</span>
               <span>25M</span>
               <span>0</span>
             </div>
              <div className="w-full h-full flex items-end justify-around pl-8 gap-1">
                {revenueTrend.map((height, i) => {
                  const max = Math.max(...revenueTrend, 1);
                  const percentage = (height / max) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center group w-1/12 relative">
                      <div 
                        className="w-full bg-primary rounded-t-[var(--radius-sm)] transition-all duration-500 hover:bg-primary-hover group-hover:-translate-y-1 relative" 
                        style={{ height: `${percentage}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-medium py-0.5 px-2 rounded whitespace-nowrap transition-opacity">
                          {height.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <span className="text-[10px] font-medium mt-2 text-muted-foreground">N{i+1}</span>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1 card-elevated p-6 flex flex-col">
           <div className="flex items-center justify-between mb-5">
             <h3 className="font-semibold text-foreground">Đơn hàng mới</h3>
             <button className="text-xs font-medium text-primary hover:underline">Xem tất cả</button>
           </div>
           <div className="space-y-3 flex-1">
             {recentOrders.map((order) => (
               <div key={order.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-[var(--radius-md)] hover:bg-secondary transition-colors cursor-pointer">
                  <div className="min-w-0">
                    <h5 className="text-xs font-semibold text-foreground truncate max-w-[120px]">{order.id}</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.user?.name || 'Khách vãng lai'}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-semibold text-sm text-foreground">{Number(order.totalAmount).toLocaleString('vi-VN')}₫</p>
                    <span className={`text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${
                      order.status === 'DELIVERED' ? 'bg-accent/10 text-accent' :
                      order.status === 'SHIPPED' ? 'bg-primary/10 text-primary' :
                      order.status === 'PROCESSING' ? 'bg-warning/10 text-warning' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
