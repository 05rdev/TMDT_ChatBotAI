'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Variant {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProduct?: any; // null = CREATE mode
}

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

export default function ProductFormModal({ isOpen, onClose, onSuccess, editProduct }: Props) {
  const isEdit = !!editProduct;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    variants: [{ name: 'Mặc định', sku: '', price: 0, stock: 0 }],
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editProduct) {
        setForm({
          name: editProduct.name || '',
          slug: editProduct.slug || '',
          description: editProduct.description || '',
          categoryId: editProduct.categoryId || '',
          variants: editProduct.variants?.length > 0
            ? editProduct.variants.map((v: any) => ({
                name: v.name,
                sku: v.sku,
                price: Number(v.price),
                stock: v.stock,
              }))
            : [{ name: 'Mặc định', sku: '', price: 0, stock: 0 }],
        });
      } else {
        setForm({
          name: '',
          slug: '',
          description: '',
          categoryId: '',
          variants: [{ name: 'Mặc định', sku: '', price: 0, stock: 0 }],
        });
      }
      setImageFiles([]);
    }
  }, [isOpen, editProduct]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const data = res.data.data || res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải danh mục', err);
    }
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : generateSlug(name) + '-' + Math.random().toString(36).substring(2, 8),
    }));
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', sku: '', price: 0, stock: 0 }],
    }));
  };

  const removeVariant = (idx: number) => {
    if (form.variants.length <= 1) return;
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const updateVariant = (idx: number, field: keyof Variant, value: string | number) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) {
      toast.error('Vui lòng điền đầy đủ tên và danh mục');
      return;
    }

    const hasEmptySku = form.variants.some(v => !v.sku.trim());
    if (hasEmptySku) {
      toast.error('Vui lòng điền SKU cho tất cả phiên bản');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        categoryId: form.categoryId,
        variants: form.variants.map(v => ({
          name: v.name,
          sku: v.sku,
          price: Number(v.price),
          stock: Number(v.stock),
        })),
      };

      let productId: string;

      if (isEdit) {
        const res = await api.put(`/products/${editProduct.id}`, payload);
        productId = editProduct.id;
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        const res = await api.post('/products', payload);
        productId = res.data.data?.id;
        toast.success('Tạo sản phẩm thành công');
      }

      // Upload images if selected
      if (imageFiles.length > 0 && productId) {
        const formData = new FormData();
        imageFiles.forEach(file => formData.append('images', file));
        await api.post(`/products/${productId}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_var(--foreground)] m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-accent border-b-4 border-foreground px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">
            {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="p-2 border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Tên sản phẩm *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
              placeholder="Nhập tên sản phẩm..."
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Danh mục *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all resize-none"
              placeholder="Mô tả sản phẩm..."
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Ảnh sản phẩm</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-3 border-2 border-dashed border-foreground bg-secondary hover:bg-accent transition-colors font-bold text-sm uppercase tracking-wider">
                <Upload className="w-4 h-4" />
                Chọn ảnh ({imageFiles.length})
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                />
              </label>
              {imageFiles.length > 0 && (
                <button type="button" onClick={() => setImageFiles([])} className="text-xs font-bold text-red-500 hover:underline uppercase">
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-foreground">Phiên bản sản phẩm *</label>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 px-3 py-1.5 border-2 border-foreground bg-accent text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--foreground)] hover:-translate-y-0.5 transition-transform"
              >
                <Plus className="w-3 h-3" /> Thêm
              </button>
            </div>

            {form.variants.map((variant, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-end p-4 border-2 border-foreground bg-secondary">
                <div className="col-span-12 sm:col-span-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tên</span>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                    className="w-full bg-background border-2 border-foreground p-2 text-sm font-bold focus:outline-none"
                    placeholder="VD: Đỏ, XL"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU *</span>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                    className="w-full bg-background border-2 border-foreground p-2 text-sm font-bold focus:outline-none"
                    placeholder="SKU-001"
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-2 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giá (₫)</span>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                    className="w-full bg-background border-2 border-foreground p-2 text-sm font-bold focus:outline-none"
                    min={0}
                  />
                </div>
                <div className="col-span-6 sm:col-span-2 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tồn kho</span>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                    className="w-full bg-background border-2 border-foreground p-2 text-sm font-bold focus:outline-none"
                    min={0}
                  />
                </div>
                <div className="col-span-6 sm:col-span-2 flex justify-end">
                  {form.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-2 border-2 border-foreground bg-background hover:bg-red-500 hover:text-white transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
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
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
