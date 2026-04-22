'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Package, MapPin, Phone, User, Calendar, CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

export default function OrderDetailModal({ isOpen, onClose, orderId }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải chi tiết đơn hàng');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Chờ duyệt', color: 'text-warning bg-warning/10', icon: Clock };
      case 'PROCESSING': return { label: 'Đang gói hàng', color: 'text-accent bg-accent/10', icon: Package };
      case 'SHIPPED': return { label: 'Đang giao', color: 'text-primary bg-primary/10', icon: Clock };
      case 'DELIVERED': return { label: 'Hoàn tất', color: 'text-success bg-success/10', icon: CheckCircle2 };
      case 'CANCELLED': return { label: 'Đã hủy', color: 'text-danger bg-danger/10', icon: XCircle };
      default: return { label: status, color: 'text-muted-foreground bg-secondary', icon: Clock };
    }
  };

  const statusInfo = order ? getStatusInfo(order.status) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-card rounded-[var(--radius-xl)] border border-border shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-secondary/30">
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              Chi tiết đơn hàng
              {order && <span className="text-sm font-mono text-muted-foreground">#{order.id.slice(0, 8)}</span>}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Xem chi tiết các sản phẩm và thông tin khách hàng.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading || !order ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Đang tải thông tin đơn hàng...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-[var(--radius-lg)] bg-secondary/20 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ngày đặt</span>
                  </div>
                  <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div className="p-4 rounded-[var(--radius-lg)] bg-secondary/20 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Thanh toán</span>
                  </div>
                  <p className="text-sm font-semibold">{order.payment?.method} - {order.payment?.status}</p>
                </div>
                <div className={`p-4 rounded-[var(--radius-lg)] border border-border ${statusInfo?.color}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {statusInfo && <statusInfo.icon className="w-4 h-4" />}
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">Trạng thái</span>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-tight">{statusInfo?.label}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Khách hàng
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">{order.user?.name || 'Khách vãng lai'}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> {order.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Địa chỉ giao hàng
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed bg-secondary/20 p-3 rounded-[var(--radius-md)] border border-border/50">
                    {order.address}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Package className="w-4 h-4" /> Danh sách sản phẩm
                </h3>
                <div className="border border-border rounded-[var(--radius-lg)] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/30 text-xs font-semibold text-muted-foreground">
                        <th className="px-4 py-3">Sản phẩm</th>
                        <th className="px-4 py-3 text-center">SL</th>
                        <th className="px-4 py-3 text-right">Đơn giá</th>
                        <th className="px-4 py-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {order.items.map((item: any, idx: number) => (
                        <tr key={idx} className="text-sm">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {item.product?.images?.[0]?.url ? (
                                <img src={item.product.images[0].url} className="w-10 h-10 object-cover rounded-md border border-border" alt="" />
                              ) : (
                                <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center"><Package className="w-4 h-4 opacity-20" /></div>
                              )}
                              <div>
                                <p className="font-semibold text-foreground line-clamp-1">{item.product?.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Phân loại: {item.variant?.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-muted-foreground">{item.quantity}</td>
                          <td className="px-4 py-4 text-right font-medium">{Number(item.price).toLocaleString('vi-VN')}₫</td>
                          <td className="px-4 py-4 text-right font-bold text-foreground">
                            {(item.quantity * Number(item.price)).toLocaleString('vi-VN')}₫
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-secondary/10">
                        <td colSpan={3} className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Tạm tính</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-foreground">
                          {order.items.reduce((sum: number, item: any) => sum + (item.quantity * Number(item.price)), 0).toLocaleString('vi-VN')}₫
                        </td>
                      </tr>
                      {order.voucher && (
                        <tr className="bg-success/5">
                          <td colSpan={3} className="px-4 py-3 text-right text-xs font-semibold text-success uppercase">Voucher ({order.voucher.code})</td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-success">
                            - {(order.items.reduce((sum: number, item: any) => sum + (item.quantity * Number(item.price)), 0) - Number(order.totalAmount)).toLocaleString('vi-VN')}₫
                          </td>
                        </tr>
                      )}
                      <tr className="bg-secondary/20">
                        <td colSpan={3} className="px-4 py-4 text-right text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tổng cộng</td>
                        <td className="px-4 py-4 text-right text-lg font-bold text-primary">
                          {Number(order.totalAmount).toLocaleString('vi-VN')}₫
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border bg-secondary/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
