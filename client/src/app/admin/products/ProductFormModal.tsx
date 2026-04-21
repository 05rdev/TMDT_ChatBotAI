'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Upload, CheckCircle2 } from 'lucide-react';
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
      // Frontend Validation
      if (!form.name.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
      if (!form.slug.trim()) return toast.error('Vui lòng nhập đường dẫn (slug)');
      if (!form.categoryId) return toast.error('Vui lòng chọn danh mục cho sản phẩm');
      if (form.variants.length === 0) return toast.error('Phải có ít nhất 1 phân loại (Phiên bản)');
      
      const hasInvalidVariant = form.variants.some(v => !v.name || !v.sku || Number(v.price) < 0 || Number(v.stock) < 0);
      if (hasInvalidVariant) return toast.error('Thông tin phiên bản không hợp lệ (Tên, SKU, Giá hoặc Tồn kho)');

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-[var(--radius-xl)] shadow-xl custom-scrollbar animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-secondary/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-heading text-foreground">
            {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Tên sản phẩm <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-background border border-border rounded-[var(--radius-md)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                placeholder="Nhập tên sản phẩm..."
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Danh mục <span className="text-danger">*</span></label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full bg-background border border-border rounded-[var(--radius-md)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-background border border-border rounded-[var(--radius-md)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-foreground custom-scrollbar"
              placeholder="Mô tả sản phẩm..."
            />
          </div>

          {/* Images */}
          <div className="space-y-4 pt-4 border-t border-border">
            <label className="text-sm font-semibold text-foreground">Hình ảnh sản phẩm</label>
            
            {/* Existing Images */}
            {isEdit && editProduct.images && editProduct.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {editProduct.images.map((img: any) => (
                  <div key={img.id} className="relative group aspect-square rounded-[var(--radius-lg)] border border-border overflow-hidden bg-secondary/10">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.isPrimary && (
                        <button 
                          type="button"
                          onClick={async () => {
                            try {
                              await api.patch(`/products/${editProduct.id}/images/${img.id}/primary`);
                              toast.success('Đã đổi ảnh chính');
                              onSuccess(); // Refresh product detail might be needed or just re-fetch
                              onClose(); // Simplest is to close and re-open/refresh
                            } catch (err) { toast.error('Lỗi khi đổi ảnh chính'); }
                          }}
                          className="p-1.5 bg-white text-primary rounded-full hover:scale-110 transition-transform" 
                          title="Đặt làm ảnh chính"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={async () => {
                          if (confirm('Xóa ảnh này?')) {
                            try {
                              await api.delete(`/products/images/${img.id}`);
                              toast.success('Đã xóa ảnh');
                              onSuccess();
                              onClose();
                            } catch (err) { toast.error('Lỗi khi xóa ảnh'); }
                          }
                        }}
                        className="p-1.5 bg-white text-danger rounded-full hover:scale-110 transition-transform" 
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                        CHÍNH
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground italic">Tải ảnh mới lên (tối đa 5 ảnh một lần):</p>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] border border-dashed border-border bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  Chọn ảnh mới ({imageFiles.length})
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  />
                </label>
                {imageFiles.length > 0 && (
                  <button type="button" onClick={() => setImageFiles([])} className="text-sm font-medium text-danger hover:underline">
                    Xóa tất cả
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Phiên bản sản phẩm <span className="text-danger">*</span></label>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/50 hover:bg-secondary text-sm font-medium text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm bản
              </button>
            </div>

            <div className="space-y-3">
              {form.variants.map((variant, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end p-4 rounded-[var(--radius-lg)] border border-border bg-secondary/20">
                  <div className="col-span-12 sm:col-span-3 space-y-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tên phân loại</span>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                      className="w-full bg-background border border-border rounded-[var(--radius-md)] p-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      placeholder="VD: Đỏ, XL"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3 space-y-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">SKU *</span>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                      className="w-full bg-background border border-border rounded-[var(--radius-md)] p-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      placeholder="SKU-001"
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2 space-y-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Giá (₫)</span>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-[var(--radius-md)] p-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      min={0}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2 space-y-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tồn kho</span>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-[var(--radius-md)] p-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      min={0}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2 flex justify-end pb-1">
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-2 rounded-[var(--radius-md)] text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Hủy
            </button>
            <Button type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-full">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
