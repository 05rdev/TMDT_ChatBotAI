'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Clock, CheckCircle2, Package, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import OrderDetailModal from './OrderDetailModal';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal Detail State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
        return <span className="px-2.5 py-1 bg-warning/10 text-warning rounded-full text-[11px] font-semibold flex items-center w-fit"><Clock className="w-3.5 h-3.5 mr-1" /> Chờ duyệt</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-[11px] font-semibold flex items-center w-fit"><Package className="w-3.5 h-3.5 mr-1" /> Đang gói</span>;
      case 'SHIPPED':
      case 'DELIVERING':
        return <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-semibold flex items-center w-fit"><Clock className="w-3.5 h-3.5 mr-1" /> Đang giao</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-success/10 text-success rounded-full text-[11px] font-semibold flex items-center w-fit"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Hoàn tất</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-danger/10 text-danger rounded-full text-[11px] font-semibold flex items-center w-fit"><XCircle className="w-3.5 h-3.5 mr-1" /> Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quản lý Đơn hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">Kiểm soát và thay đổi trạng thái các đơn giao dịch.</p>
        </div>
      </div>

      <div className="card-elevated p-4 rounded-[var(--radius-xl)] bg-card border border-border flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="w-4.5 h-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo Mã đơn hoặc Số điện thoại..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-[var(--radius-lg)] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-secondary/50 border border-border rounded-[var(--radius-lg)] text-sm px-4 py-2.5 outline-none text-foreground hidden sm:block focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="PROCESSING">Đang gói</option>
            <option value="SHIPPED">Đang giao</option>
            <option value="DELIVERED">Hoàn tất</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <Button variant="outline" className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Lọc
          </Button>
        </div>
      </div>

      {/* Table Data */}
      <div className="card-elevated rounded-[var(--radius-xl)] border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Mã Đơn</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Giá trị</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p className="font-medium text-sm">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-foreground whitespace-nowrap">
                    <span className="truncate max-w-[120px] inline-block">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-foreground">{order.user?.name || 'Khách vãng lai'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground whitespace-nowrap">
                    {Number(order.totalAmount).toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-3">
                       <select 
                         onChange={(e) => updateStatus(order.id, e.target.value)}
                         value={order.status}
                         className="bg-secondary/50 border border-border rounded-[var(--radius-sm)] text-xs px-2.5 py-1.5 outline-none text-foreground focus:ring-1 focus:ring-primary/50"
                       >
                         <option value="PENDING">Chờ duyệt</option>
                         <option value="PROCESSING">Đang gói</option>
                         <option value="SHIPPED">Đang giao</option>
                         <option value="DELIVERED">Hoàn tất</option>
                         <option value="CANCELLED">Hủy đơn</option>
                       </select>
                       <button 
                         onClick={() => { setSelectedOrderId(order.id); setIsDetailOpen(true); }}
                         className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[var(--radius-md)] transition-colors" 
                         title="Xem chi tiết"
                       >
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
        <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-secondary/20">
           <span>Hiển thị 1 - 5 của 45 đơn hàng</span>
           <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50">Trước</button>
              <button className="px-3 py-1.5 rounded-[var(--radius-md)] bg-primary text-primary-foreground font-medium">1</button>
              <button className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors">2</button>
              <button className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors">Tiếp</button>
           </div>
        </div>
      </div>

      <OrderDetailModal 
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedOrderId(null); }}
        orderId={selectedOrderId}
      />
    </div>
  );
}
