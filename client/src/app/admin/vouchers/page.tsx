'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowRight
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
  endDate: string;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    minOrderValue: '',
    usageLimit: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/vouchers');
      if (res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (err) {
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
    try {
      await api.delete(`/vouchers/${id}`);
      toast.success('Đã xóa voucher');
      fetchVouchers();
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-foreground pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground flex items-center">
            Quản lý Voucher <Tag className="ml-4 w-10 h-10 text-primary" />
          </h1>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Tạo và quản lý các chương trình khuyến mãi</p>
        </div>

        <Button 
          onClick={() => { setEditingVoucher(null); setIsModalOpen(true); }}
          className="shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-y-1 active:shadow-none h-14 px-8 text-lg"
        >
          <Plus className="w-6 h-6 mr-2" /> Tạo mã mới
        </Button>
      </div>

      {isLoading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <p className="text-xl font-black uppercase tracking-widest animate-pulse">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((v) => (
            <div key={v.id} className="solid-card bg-background border-4 shadow-[8px_8px_0px_0px_var(--foreground)] flex flex-col group overflow-hidden">
              <div className="p-6 space-y-6 flex-1">
                <div className="flex items-start justify-between">
                  <div className="bg-primary text-primary-foreground px-4 py-2 border-2 border-foreground font-black uppercase tracking-tighter text-xl shadow-[2px_2px_0px_0px_var(--foreground)]">
                    {v.code}
                  </div>
                  {v.isActive ? <CheckCircle2 className="text-emerald-500 w-6 h-6" /> : <XCircle className="text-red-500 w-6 h-6" />}
                </div>

                <div className="space-y-2">
                  <p className="text-3xl font-black text-foreground">
                    {v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString()}đ`}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {v.discountType === 'PERCENT' ? 'Giảm theo phần trăm' : 'Giảm trực tiếp'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-foreground border-dashed">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Lượt dùng</p>
                    <p className="font-bold text-sm">{v.usedCount} / {v.usageLimit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Hết hạn</p>
                    <p className="font-bold text-sm flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(v.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex border-t-4 border-foreground">
                <button 
                  onClick={() => { 
                    setEditingVoucher(v);
                    setFormData({
                      code: v.code,
                      discountType: v.discountType,
                      discountValue: v.discountValue.toString(),
                      minOrderValue: v.minOrderValue?.toString() || '',
                      usageLimit: v.usageLimit.toString(),
                      startDate: new Date().toISOString().split('T')[0], // Placeholder
                      endDate: new Date(v.endDate).toISOString().split('T')[0],
                      isActive: v.isActive
                    });
                    setIsModalOpen(true); 
                  }}
                  className="flex-1 bg-accent text-foreground py-4 font-black uppercase tracking-widest text-xs border-r-4 border-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Sửa
                </button>
                <button 
                  onClick={() => handleDelete(v.id)}
                  className="flex-1 bg-red-500 text-white py-4 font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-2xl bg-background border-4 border-foreground shadow-[16px_16px_0px_0px_var(--foreground)] max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b-4 border-foreground bg-accent flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{editingVoucher ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><XCircle className="w-8 h-8" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Mã Voucher" placeholder="VD: SUMMER2024" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest">Loại giảm giá</label>
                    <select 
                      value={formData.discountType} 
                      onChange={e => setFormData({...formData, discountType: e.target.value as any})}
                      className="w-full h-12 bg-background border-4 border-foreground px-4 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
                    >
                      <option value="PERCENT">Phần trăm (%)</option>
                      <option value="FIXED">Số tiền cố định (đ)</option>
                    </select>
                  </div>
                  <Input label="Giá trị giảm" type="number" placeholder="VD: 10 hoặc 50000" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required />
                  <Input label="Đơn tối thiểu" type="number" placeholder="VD: 100000" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} />
                  <Input label="Số lượng mã" type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} required />
                  <div className="flex items-center space-x-4 h-12 mt-8">
                     <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-6 h-6 border-4 border-foreground rounded-none accent-primary" />
                     <label htmlFor="isActive" className="font-black uppercase tracking-widest text-sm">Kích hoạt ngay</label>
                  </div>
                  <Input label="Ngày bắt đầu" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                  <Input label="Ngày kết thúc" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                </div>

                <div className="pt-6">
                   <Button type="submit" className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_var(--foreground)]">
                      {editingVoucher ? 'Cập nhật ngay' : 'Tạo mã Voucher'} <ArrowRight className="ml-3 w-6 h-6" />
                   </Button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
