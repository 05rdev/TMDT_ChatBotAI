'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function UserEditModal({ isOpen, onClose, onSuccess, user }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'USER', isActive: true });

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update role if changed
      if (form.role !== user.role) {
        await api.patch(`/admin/users/${user.id}/role`, { role: form.role });
      }
      // Update status if changed
      if (form.isActive !== user.isActive) {
        await api.patch(`/admin/users/${user.id}/status`, { isActive: form.isActive });
      }
      // Update name/email via admin update endpoint
      if (form.name !== user.name || form.email !== user.email) {
        await api.put(`/admin/users/${user.id}`, { name: form.name, email: form.email });
      }

      toast.success('Cập nhật người dùng thành công');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_var(--foreground)] m-4">
        {/* Header */}
        <div className="bg-accent border-b-4 border-foreground px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Sửa người dùng</h2>
          <button onClick={onClose} className="p-2 border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Họ tên</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Vai trò</label>
            <select
              value={form.role}
              onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Trạng thái</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, isActive: true }))}
                className={`px-4 py-2 border-2 border-foreground font-bold text-sm uppercase tracking-wider transition-all ${
                  form.isActive
                    ? 'bg-emerald-400 text-emerald-950 shadow-[2px_2px_0px_0px_#059669]'
                    : 'bg-background text-foreground'
                }`}
              >
                Hoạt động
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, isActive: false }))}
                className={`px-4 py-2 border-2 border-foreground font-bold text-sm uppercase tracking-wider transition-all ${
                  !form.isActive
                    ? 'bg-red-400 text-red-950 shadow-[2px_2px_0px_0px_#dc2626]'
                    : 'bg-background text-foreground'
                }`}
              >
                Khóa
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t-4 border-foreground">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-foreground bg-background font-bold text-sm uppercase tracking-wider hover:bg-secondary transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]"
            >
              Hủy
            </button>
            <Button type="submit" disabled={isSubmitting} className="px-8 py-3 text-sm shadow-[4px_4px_0px_0px_var(--foreground)]">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Cập nhật
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
