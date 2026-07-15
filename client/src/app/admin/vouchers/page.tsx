'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  categoryId?: string;
  productId?: string;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [products, setProducts] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    minOrderValue: '',
    usageLimit: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    categoryId: '',
    productId: '',
    isActive: true
  });

  useEffect(() => {
    fetchVouchers();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      if (res.data.success) setProducts(res.data.data.products || res.data.data);
    } catch {}
  };

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/vouchers');
      if (res.data.success) {
        setVouchers(res.data.data);
      }
    } catch {
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        usageLimit: Number(formData.usageLimit),
        categoryId: formData.categoryId || undefined,
        productId: formData.productId || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingVoucher) {
        await api.put(`/vouchers/${editingVoucher.id}`, payload);
        toast.success('Cập nhật voucher thành công');
      } else {
        await api.post('/vouchers', payload);
        toast.success('Tạo voucher mới thành công');
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
    try {
      await api.delete(`/vouchers/${id}`);
      toast.success('Đã xóa voucher');
      fetchVouchers();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const totalPages = Math.max(1, Math.ceil(vouchers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedVouchers = vouchers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <>
      <div className="admin-page animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <h1 className="admin-title flex items-center">
              Quản lý Voucher
            </h1>
            <p className="text-muted-foreground text-sm">Tạo và quản lý các chương trình khuyến mãi</p>
          </div>

          <Button 
            onClick={() => { setEditingVoucher(null); setIsModalOpen(true); }}
            className="shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" /> Tạo mã mới
          </Button>
        </div>

        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {paginatedVouchers.map((v) => (
              <div key={v.id} className="admin-card flex flex-col group overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6 space-y-5 flex-1 relative">
                  {/* Decorator */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] pointer-events-none" />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-[var(--radius-md)] font-bold tracking-widest text-sm border border-primary/20">
                      {v.code}
                    </div>
                    {v.isActive ? <CheckCircle2 className="text-success w-5 h-5" /> : <XCircle className="text-danger w-5 h-5" />}
                  </div>

                  <div className="space-y-1 relative z-10">
                    <p className="font-heading text-3xl text-foreground">
                      {v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString()}đ`}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {v.discountType === 'PERCENT' ? 'Giảm theo phần trăm' : 'Giảm trực tiếp'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Lượt dùng</p>
                      <p className="font-semibold text-sm text-foreground">{v.usedCount} <span className="text-muted-foreground font-normal">/ {v.usageLimit}</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Hết hạn</p>
                      <p className="font-semibold text-sm flex items-center text-foreground">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        {new Date(v.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-border bg-secondary/30">
                  <button 
                    onClick={() => { 
                      setEditingVoucher(v);
                      setFormData({
                        code: v.code,
                        discountType: v.discountType,
                        discountValue: v.discountValue.toString(),
                        minOrderValue: v.minOrderValue?.toString() || '',
                        usageLimit: v.usageLimit.toString(),
                        startDate: v.startDate.split('T')[0],
                        endDate: v.endDate.split('T')[0],
                        categoryId: v.categoryId || '',
                        productId: v.productId || '',
                        isActive: v.isActive
                      });
                      setIsModalOpen(true); 
                    }}
                    className="flex-1 py-3.5 font-semibold text-sm border-r border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-foreground"
                  >
                    <Edit3 className="w-4 h-4" /> Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="flex-1 text-danger py-3.5 font-semibold text-sm hover:bg-danger/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-pagination admin-card">
            <span>
              Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, vouchers.length)} của {vouchers.length} voucher
            </span>
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium ${
                    currentPage === pageNum ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary transition-colors'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Tiếp
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-[8px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className="px-4 sm:px-8 py-5 border-b border-border flex items-center justify-between gap-4 bg-secondary/30">
              <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">
                  {editingVoucher ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Điền thông tin chi tiết để thiết lập chương trình khuyến mãi.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-[8px] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
              <form id="voucher-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Mã Voucher" placeholder="VD: SUMMER2024" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Loại giảm giá</label>
                    <select 
                      value={formData.discountType} 
                      onChange={e => setFormData({...formData, discountType: e.target.value as 'PERCENT' | 'FIXED'})}
                      className="w-full h-[42px] bg-background border border-border rounded-[var(--radius-md)] px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="PERCENT">Phần trăm (%)</option>
                      <option value="FIXED">Số tiền cố định (đ)</option>
                    </select>
                  </div>
                  
                  <Input label="Giá trị giảm" type="number" placeholder="VD: 10 hoặc 50000" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required />
                  <Input label="Đơn tối thiểu" type="number" placeholder="VD: 100000" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} />
                  <Input label="Số lượng mã" type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} required />
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Áp dụng Danh mục (Tùy chọn)</label>
                    <select 
                      value={formData.categoryId} 
                      onChange={e => setFormData({...formData, categoryId: e.target.value, productId: ''})}
                      className="w-full h-[42px] bg-background border border-border rounded-[var(--radius-md)] px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Hoặc Sản phẩm (Tùy chọn)</label>
                    <select 
                      value={formData.productId} 
                      onChange={e => setFormData({...formData, productId: e.target.value, categoryId: ''})}
                      className="w-full h-[42px] bg-background border border-border rounded-[var(--radius-md)] px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Tất cả sản phẩm</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center space-x-3 h-[42px] mt-7">
                     <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded-[var(--radius-sm)] border-border text-primary focus:ring-primary" />
                     <label htmlFor="isActive" className="font-medium text-sm text-foreground cursor-pointer">Kích hoạt ngay</label>
                  </div>
                  
                  <Input label="Ngày bắt đầu" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                  <Input label="Ngày kết thúc" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                </div>
              </form>
            </div>

            {/* Static Footer */}
            <div className="px-4 sm:px-8 py-4 border-t border-border bg-secondary/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-[8px]"
              >
                Hủy
              </button>
              <Button 
                type="submit" 
                form="voucher-form" 
                className="px-6 h-10 shadow-md hover:shadow-lg"
              >
                {editingVoucher ? 'Cập nhật ngay' : 'Tạo mã Voucher'}
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
