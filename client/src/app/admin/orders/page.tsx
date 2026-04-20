'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Clock, CheckCircle2, Package, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/orders', { params: { status: filterStatus } });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (!newStatus) return;
    try {
      const res = await api.patch(`/orders/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success('Cập nhật trạng thái thành công');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-bold flex items-center w-fit"><Package className="w-3 h-3 mr-1" /> Đang gói</span>;
      case 'DELIVERING':
        return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-[10px] font-bold flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Đang giao</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn tất</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Đơn hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">Kiểm soát và thay đổi trạng thái các đơn giao dịch.</p>
        </div>
      </div>

      <div className="glass-card p-4 rounded-2xl border-border flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo Mã đơn hoặc Số điện thoại..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-foreground"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background border border-border rounded-xl text-sm px-3 py-2 outline-none text-foreground hidden sm:block"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="PROCESSING">Đang gói</option>
            <option value="SHIPPED">Đang giao</option>
            <option value="DELIVERED">Hoàn tất</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <Button variant="outline" className="flex items-center bg-background border-border">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Lọc
          </Button>
        </div>
      </div>

      {/* Table Data */}
      <div className="glass-card rounded-2xl border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Mã Đơn</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Giá trị</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-foreground whitespace-nowrap">
                    <span className="truncate max-w-[120px] inline-block">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{order.user?.name || 'Khách vãng lai'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-500 whitespace-nowrap">
                    {Number(order.totalAmount).toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                       <select 
                         onChange={(e) => updateStatus(order.id, e.target.value)}
                         value={order.status}
                         className="bg-background border border-border rounded-lg text-xs px-2 py-1 outline-none text-foreground border-dashed"
                       >
                         <option value="PENDING">Chờ duyệt</option>
                         <option value="PROCESSING">Đang gói</option>
                         <option value="SHIPPED">Đang giao</option>
                         <option value="DELIVERED">Hoàn tất</option>
                         <option value="CANCELLED">Hủy đơn</option>
                       </select>
                       <button className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Xem chi tiết">
                         <Eye className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
           <span>Hiển thị 1 - 5 của 45 đơn hàng</span>
           <div className="flex items-center space-x-2">
              <button className="px-3 py-1 rounded-lg border border-border hover:bg-muted/10 transition-colors disabled:opacity-50">Trước</button>
              <button className="px-3 py-1 rounded-lg bg-emerald-500 text-white font-medium">1</button>
              <button className="px-3 py-1 rounded-lg border border-border hover:bg-muted/10 transition-colors">2</button>
              <button className="px-3 py-1 rounded-lg border border-border hover:bg-muted/10 transition-colors">Tiếp</button>
           </div>
        </div>
      </div>
    </div>
  );
}
