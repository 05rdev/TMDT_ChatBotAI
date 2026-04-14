'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats'); // We built this endpoint in the BE
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Thống kê tổng quan</h1>
            <p className="text-slate-400">Chào mừng trở lại, đây là những gì đang diễn ra với UltraShop.</p>
         </div>
         <button className="btn-primary py-2.5 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" /> Xuất báo cáo
         </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value="125,430,000đ" 
          change="+12.5%" 
          trend="up" 
          icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
        />
        <StatCard 
          title="Đơn hàng mới" 
          value="456" 
          change="+8.2%" 
          trend="up" 
          icon={<ShoppingBag className="w-6 h-6 text-cyan-400" />}
        />
        <StatCard 
          title="Khách hàng" 
          value="1,240" 
          change="-2.4%" 
          trend="down" 
          icon={<Users className="w-6 h-6 text-blue-400" />}
        />
        <StatCard 
          title="Tỷ lệ hoàn thành" 
          value="98.2%" 
          change="+0.5%" 
          trend="up" 
          icon={<CheckCircle2 className="w-6 h-6 text-amber-400" />}
        />
      </div>

      {/* Charts & Lists Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Main Chart Placeholder */}
         <div className="xl:col-span-2 glass-card rounded-3xl p-8 border-white/5 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold">Biểu đồ tăng trưởng</h3>
               <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  <option>7 ngày qua</option>
                  <option>30 ngày qua</option>
               </select>
            </div>
            <div className="h-[300px] w-full bg-slate-800/20 rounded-2xl flex items-center justify-center border border-dashed border-white/10">
               <div className="text-center space-y-2">
                  <TrendingUp className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-slate-500 text-sm italic">Dữ liệu biểu đồ thời gian thực đang được cập nhật...</p>
               </div>
            </div>
         </div>

         {/* Recent Orders / Alerts */}
         <div className="glass-card rounded-3xl border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
               <h3 className="font-bold flex items-center text-amber-400">
                  <AlertCircle className="w-4 h-4 mr-2" /> Cảnh báo kho
               </h3>
               <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">URGENT</span>
            </div>
            <div className="flex-1 p-6 space-y-4">
               <LowStockItem name="Áo Thun Premium v2" stock={3} />
               <LowStockItem name="Quần Jean Slimfit" stock={5} />
               <LowStockItem name="Balo Laptop Pro" stock={0} />
               <LowStockItem name="Sơ mi Oxford" stock={8} />
            </div>
            <button className="p-4 bg-white/5 hover:bg-emerald-500/10 text-center text-sm font-medium transition-all text-slate-400 hover:text-emerald-400 border-t border-white/5">
               Xem tất cả thông báo
            </button>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon }: any) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 space-y-4 hover:border-emerald-500/30 transition-all group">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
           {change} {trend === 'up' ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
    </div>
  );
}

function LowStockItem({ name, stock }: any) {
   return (
      <div className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
         <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
               <Package className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-300">{name}</span>
         </div>
         <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stock === 0 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
            {stock === 0 ? 'HẾT HÀNG' : `CÒN ${stock}`}
         </span>
      </div>
   );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
