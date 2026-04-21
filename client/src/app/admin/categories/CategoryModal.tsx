'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
  allCategories: Category[];
}

export default function CategoryModal({ isOpen, onClose, onSuccess, category, allCategories }: Props) {
  const isEdit = !!category;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', parentId: '' });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setForm({
          name: category.name,
          slug: category.slug,
          parentId: category.parentId || '',
        });
      } else {
        setForm({ name: '', slug: '', parentId: '' });
      }
    }
  }, [isOpen, category]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        parentId: form.parentId === '' ? null : form.parentId,
      };

      if (isEdit) {
        await api.put(`/categories/${category.id}`, payload);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await api.post('/categories', payload);
        toast.success('Thêm danh mục mới thành công');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filter out current category from potential parents to avoid circular dependency
  const potentialParents = allCategories.filter(c => !category || c.id !== category.id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card rounded-[var(--radius-xl)] border border-border shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-secondary/30">
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Phân loại sản phẩm giúp khách hàng tìm kiếm dễ hơn.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Tên danh mục</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="VD: Laptop Gaming, Điện thoại..."
                required
                autoFocus
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Đường dẫn (Slug)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="laptop-gaming"
              />
            </div>

            {/* Parent Category */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Danh mục cha</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm(prev => ({ ...prev, parentId: e.target.value }))}
                className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Là danh mục cấp 1 --</option>
                {potentialParents.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Hủy bỏ
            </button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary min-w-[120px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
