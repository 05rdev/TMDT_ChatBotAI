'use client';

import React, { useState } from 'react';
import { Search, Filter, Eye, Clock, CheckCircle2, Package, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock Data
const mockOrders = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A',  phone: '0901234567', total: 3500000, date: '14/04/2026', status: 'DELIVERING' },
  { id: 'ORD-002', customer: 'Trần Thị B',    phone: '0987654321', total: 1200000, date: '14/04/2026', status: 'PENDING' },
  { id: 'ORD-003', customer: 'Lê Văn C',      phone: '0912345678', total: 890000,  date: '13/04/2026', status: 'COMPLETED' },
  { id: 'ORD-004', customer: 'Phạm Thị D',    phone: '0977112233', total: 4500000, date: '12/04/2026', status: 'PROCESSING' },
  { id: 'ORD-005', customer: 'Hoàng Văn E',   phone: '0909998877', total: 2500000, date: '10/04/2026', status: 'CANCELLED' }
];

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');

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
          <select className="bg-background border border-border rounded-xl text-sm px-3 py-2 outline-none text-foreground hidden sm:block">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="PROCESSING">Đang gói</option>
            <option value="DELIVERING">Đang giao</option>
            <option value="COMPLETED">Hoàn tất</option>
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
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-foreground whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-500 whitespace-nowrap">
                    {order.total.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                       <select className="bg-background border border-border rounded-lg text-xs px-2 py-1 outline-none text-foreground border-dashed">
                         <option>Đổi T.Thái</option>
                         <option>Đang gói</option>
                         <option>Đang giao</option>
                         <option>Hoàn tất</option>
                         <option>Hủy đơn</option>
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
