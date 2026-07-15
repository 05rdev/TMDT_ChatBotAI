'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BrainCircuit,
  Lightbulb,
  Activity,
  ChevronRight,
  Package,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import api from '@/lib/api';

type TrendMode = '7d' | '30d' | 'year';

type RevenuePoint = {
  label: string;
  total: number;
};

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenuePoint[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trendMode, setTrendMode] = useState<TrendMode>('7d');
  const [trendYear, setTrendYear] = useState(new Date().getFullYear());
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchRevenueTrend();
  }, [trendMode, trendYear]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, ordersRes, topRes, lowStockRes] = await Promise.all([
        api.get('/admin/stats/overview'),
        api.get('/admin/orders?limit=5'),
        api.get('/admin/stats/top-products?limit=5'),
        api.get('/admin/products/low-stock'),
      ]);

      if (statsRes.data.success) setStatsData(statsRes.data.data);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.orders || []);
      if (topRes.data.success) setTopProducts(topRes.data.data || []);
      if (lowStockRes.data.success) setLowStockProducts((lowStockRes.data.data || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRevenueTrend = async () => {
    try {
      if (trendMode === 'year') {
        const res = await api.get(`/admin/stats/revenue-trend?type=month&year=${trendYear}`);
        if (res.data.success) {
          setRevenueTrend(
            (res.data.data || []).map((item: any, index: number) => ({
              label: `T${index + 1}`,
              total: Number(item.total || 0),
            }))
          );
        }
        return;
      }

      const days = trendMode === '7d' ? 7 : 30;
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);

      const res = await api.get(
        `/admin/stats/revenue-trend?type=day&start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`
      );
      if (res.data.success) {
        setRevenueTrend(
          (res.data.data || []).map((item: any) => {
            const date = new Date(item.date);
            return {
              label: `${date.getDate()}/${date.getMonth() + 1}`,
              total: Number(item.total || 0),
            };
          })
        );
      }
    } catch (error) {
      console.error('Failed to load revenue trend', error);
      setRevenueTrend([]);
    }
  };

  const handleAIAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const res = await api.post('/ai/admin/analyze-revenue', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        type: 'daily',
      });
      if (res.data.success) {
        setAiAnalysis(res.data.data);
      }
    } catch (error) {
      console.error('AI Analysis failed', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatMoney = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}₫`;
  const maxRevenue = Math.max(...revenueTrend.map((item) => item.total), 1);
  const pendingOrders = recentOrders.filter((order) => order.status === 'PENDING').length;
  const processingOrders = recentOrders.filter((order) => order.status === 'PROCESSING').length;
  const yearOptions = Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index);

  const stats = statsData ? [
    { label: 'Doanh thu thực tế', value: formatMoney(statsData.revenue), change: `${formatMoney(statsData.pendingRevenue)} dự kiến`, isUp: true, icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Đơn hàng', value: statsData.orders, change: 'tổng đơn chưa hủy', isUp: true, icon: ShoppingCart, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Khách hàng', value: statsData.users, change: `+${statsData.newUsersThisMonth} tháng này`, isUp: true, icon: Users, color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Kho hàng', value: statsData.totalProducts, change: `${statsData.lowStockAlert} sắp hết`, isUp: statsData.lowStockAlert === 0, icon: TrendingUp, color: statsData.lowStockAlert > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500' },
  ] : [];

  return (
    <div className="admin-page animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        {stats.length > 0 ? stats.map((stat, idx) => (
          <div key={idx} className="admin-card p-4 sm:p-5 flex flex-col hover:shadow-lg transition-all border-l-4 border-l-primary/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
              <div className={`w-10 h-10 ${stat.color} rounded-[8px] flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">{stat.value}</h2>
            <div className="flex items-center mt-3 text-[11px] font-bold">
              {stat.isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1 text-rose-500" />}
              <span className={stat.isUp ? 'text-emerald-500' : 'text-rose-500'}>{stat.change}</span>
            </div>
          </div>
        )) : (
          [...Array(4)].map((_, i) => (
            <div key={i} className="admin-card p-5 h-32 animate-pulse bg-secondary/20" />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-card p-4 sm:p-6 flex flex-col min-h-[360px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg text-foreground">Xu hướng doanh thu</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {trendMode === 'year' ? `Dữ liệu từng tháng trong năm ${trendYear}` : `Dữ liệu ${trendMode === '7d' ? '7 ngày' : '30 ngày'} gần nhất`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-secondary/50 p-1 rounded-lg">
                {[
                  { key: '7d', label: '7 ngày' },
                  { key: '30d', label: '30 ngày' },
                  { key: 'year', label: 'Theo năm' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTrendMode(item.key as TrendMode)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      trendMode === item.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {trendMode === 'year' && (
                <select
                  value={trendYear}
                  onChange={(e) => setTrendYear(Number(e.target.value))}
                  className="admin-input w-auto py-2 text-xs font-bold"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col relative">
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] font-black text-muted-foreground/50 pr-4 border-r border-dashed border-border/50">
              <span>{(Math.max(maxRevenue, 1000000) / 1000000).toFixed(1)}M</span>
              <span>{(Math.max(maxRevenue, 1000000) / 2000000).toFixed(1)}M</span>
              <span>0</span>
            </div>

            <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-dashed border-border/30" />
              <div className="w-full border-t border-dashed border-border/30" />
              <div className="w-full border-t border-dashed border-border/30" />
            </div>

            <div className={`flex-1 flex items-end ml-10 mb-8 ${trendMode === '30d' ? 'gap-1 overflow-x-auto pb-1' : 'justify-around gap-3'}`}>
              {revenueTrend.map((item, i) => {
                const percentage = (item.total / maxRevenue) * 100;
                return (
                  <div key={`${item.label}-${i}`} className={`${trendMode === '30d' ? 'min-w-6' : 'flex-1'} flex flex-col items-center group relative h-full justify-end`}>
                    <div
                      className="w-full max-w-[40px] min-w-3 bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-700 hover:brightness-110 cursor-pointer relative"
                      style={{ height: item.total > 0 ? `${Math.max(percentage, 4)}%` : '4px' }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black py-1.5 px-3 rounded-lg whitespace-nowrap transition-all shadow-xl z-20 pointer-events-none">
                        {formatMoney(item.total)}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold mt-3 text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 admin-card p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-foreground">Đơn hàng mới</h3>
            <Link href="/admin/orders" className="text-xs font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded-md transition-all">Tất cả</Link>
          </div>
          <div className="space-y-4 flex-1">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center p-3.5 bg-secondary/30 rounded-[8px] hover:bg-secondary/50 transition-all cursor-pointer border border-transparent hover:border-border">
                <div className="min-w-0">
                  <h5 className="text-[11px] font-black text-foreground tracking-wider uppercase mb-1">#{order.id.slice(0, 8)}</h5>
                  <p className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">{order.user?.name || 'Khách vãng lai'}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-black text-sm text-foreground tracking-tight">{formatMoney(order.totalAmount)}</p>
                  <span className={`text-[9px] font-black mt-1.5 px-2.5 py-0.5 rounded-lg inline-block uppercase tracking-tighter ${
                    order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500' :
                    order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                    order.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    {order.status === 'PROCESSING' ? 'Đang gói' : order.status === 'PENDING' ? 'Chờ duyệt' : order.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-50">
                <ShoppingCart className="w-10 h-10 mb-2" />
                <p className="text-xs font-bold">Chưa có đơn hàng mới</p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card p-4 sm:p-6 flex flex-col">
          <h3 className="font-bold text-lg text-foreground mb-6">Top sản phẩm</h3>
          <div className="space-y-4 flex-1">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={product.id || idx} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-[8px]">
                <div className="w-8 h-8 rounded-[8px] bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate uppercase tracking-tighter">{product.name}</h4>
                  <p className="text-[10px] text-muted-foreground">Đã bán: {product.totalSold}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="admin-card p-4 sm:p-6 flex flex-col">
          <h3 className="font-bold text-lg text-foreground mb-6">Sản phẩm sắp hết hàng</h3>
          <div className="space-y-4 flex-1">
            {lowStockProducts.length > 0 ? lowStockProducts.map((variant) => (
              <div key={variant.id} className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-[8px]">
                <div className="w-9 h-9 rounded-[8px] bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground truncate">{variant.product?.name}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{variant.name} · SKU {variant.sku || 'chưa có'}</p>
                </div>
                <span className="text-xs font-black text-rose-500 shrink-0">Còn {variant.stock}</span>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-8">Không có sản phẩm sắp hết hàng</p>
            )}
          </div>
        </div>

        <div className="admin-card p-4 sm:p-6 flex flex-col">
          <h3 className="font-bold text-lg text-foreground mb-6">Việc cần xử lý</h3>
          <div className="space-y-4 flex-1">
            <Link href="/admin/orders" className="flex items-center justify-between p-3 bg-secondary/20 rounded-[8px] hover:bg-secondary/40 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold">Đơn chờ duyệt</span>
              </div>
              <span className="text-sm font-black text-foreground">{pendingOrders}</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center justify-between p-3 bg-secondary/20 rounded-[8px] hover:bg-secondary/40 transition-colors">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold">Đơn đang xử lý</span>
              </div>
              <span className="text-sm font-black text-foreground">{processingOrders}</span>
            </Link>
            <Link href="/admin/products" className="flex items-center justify-between p-3 bg-secondary/20 rounded-[8px] hover:bg-secondary/40 transition-colors">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-bold">Mặt hàng sắp hết</span>
              </div>
              <span className="text-sm font-black text-foreground">{statsData?.lowStockAlert || 0}</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="admin-card overflow-hidden border-2 border-primary/20 relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-32 h-32 text-primary" />
            </div>

            <div className="p-4 sm:p-6 lg:p-8 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BrainCircuit className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-black text-2xl text-foreground tracking-tight">AI Business Insights</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Hệ thống AI phân tích dữ liệu kinh doanh và đưa ra đề xuất chiến lược.</p>
                </div>

                <button
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 mr-3" />
                      Phân tích ngay
                    </>
                  )}
                </button>
              </div>

              {aiAnalysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <div className="p-4 sm:p-5 bg-secondary/30 rounded-[8px] border border-border/50">
                      <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-primary mb-4">
                        <TrendingUp className="w-4 h-4 mr-2" /> Phân tích xu hướng
                      </h4>
                      <p className="text-sm leading-relaxed font-medium text-foreground/80">{aiAnalysis.analysis}</p>
                    </div>

                    <div className="p-4 sm:p-5 bg-emerald-500/5 rounded-[8px] border border-emerald-500/20">
                      <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-emerald-500 mb-4">
                        <Lightbulb className="w-4 h-4 mr-2" /> Insight quan trọng
                      </h4>
                      <ul className="space-y-3">
                        {aiAnalysis.insights.map((item: string, i: number) => (
                          <li key={i} className="flex items-start text-sm font-semibold text-foreground/70">
                            <ChevronRight className="w-4 h-4 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 sm:p-6 bg-primary text-primary-foreground rounded-[8px] shadow-xl shadow-primary/20">
                      <h4 className="flex items-center text-xs font-black uppercase tracking-widest mb-6 opacity-80">
                        <Activity className="w-4 h-4 mr-2" /> Đề xuất hành động
                      </h4>
                      <div className="space-y-4">
                        {aiAnalysis.suggestions.map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-3 bg-white/10 rounded-[8px] backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                              {i + 1}
                            </div>
                            <p className="text-sm font-bold leading-tight">{item}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Trạng thái tổng thể</span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{aiAnalysis.overallStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 border-2 border-dashed border-border/50 rounded-[8px] flex flex-col items-center justify-center text-muted-foreground opacity-50 text-center px-4">
                  <Sparkles className="w-10 h-10 mb-4" />
                  <p className="text-sm font-bold">Nhấn nút phía trên để AI bắt đầu phân tích dữ liệu kinh doanh của bạn</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading && null}
    </div>
  );
}
