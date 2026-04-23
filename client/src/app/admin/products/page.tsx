'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Filter, Loader2, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import ProductFormModal from './ProductFormModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products`, {
        params: {
          page,
          limit,
          isAdmin: 'true'
        }
      });
      if (res.data.success) {
        setProducts(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
          setTotal(res.data.pagination.total);
        }
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const res = await api.delete(`/products/${id}`);
        if (res.data.success) {
          toast.success('Đã xóa sản phẩm');
          fetchProducts();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa sản phẩm');
      }
    }
  };

  const handleEdit = async (productId: string) => {
    try {
      const res = await api.get(`/products/${productId}`);
      if (res.data.success) {
        setEditProduct(res.data.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error('Lỗi khi tải chi tiết sản phẩm');
    }
  };

  const handleToggleStatus = async (product: any) => {
    try {
      const newStatus = !product.isActive;
      const res = await api.patch(`/products/${product.id}`, { isActive: newStatus });
      if (res.data.success) {
        toast.success(`Đã ${newStatus ? 'bật' : 'tắt'} hiển thị sản phẩm`);
        setProducts(products.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
      }
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái sản phẩm');
    }
  };

  const handleAdd = () => {
    setEditProduct(null);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMinPrice = (product: any): string => {
    if (product.variants && product.variants.length > 0) {
      const price = Number(product.variants[0].price);
      return isNaN(price) ? 'N/A' : price.toLocaleString('vi-VN') + '₫';
    }
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quản lý Sản phẩm</h1>
          <p className="text-sm text-muted-foreground mt-1">Tổng cộng {total} sản phẩm trên UltraShop.</p>
        </div>
        <Button className="flex items-center" onClick={handleAdd}>
          <Plus className="w-5 h-5 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

      <div className="card-elevated p-4 rounded-[var(--radius-xl)] bg-card border border-border flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="w-4.5 h-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-[var(--radius-lg)] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
          />
        </div>

        <Button variant="outline" className="flex items-center">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Lọc
        </Button>
      </div>

      {/* Table Data */}
      <div className="card-elevated bg-card rounded-[var(--radius-xl)] border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Danh mục</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Giá bán</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Tồn kho</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p className="font-medium text-sm">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <PackageX className="w-10 h-10 opacity-50" />
                      <p className="font-medium text-sm">Không tìm thấy sản phẩm</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const totalStock = product.variants ? product.variants.reduce((sum: number, v: any) => sum + v.stock, 0) : 0;
                return (
                  <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      <span className="truncate max-w-[80px] inline-block">#{product.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      <span className="bg-secondary px-2.5 py-1 rounded-full text-[11px] font-medium">{product.category?.name || 'Khác'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground whitespace-nowrap">
                      {getMinPrice(product)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap font-medium">
                      {totalStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          product.isActive
                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.isActive ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        {product.isActive ? 'Đang bán' : 'Tạm ẩn'}
                      </button>
                      {totalStock === 0 && product.isActive && (
                        <p className="text-[10px] text-rose-500 mt-1 font-medium italic">Hết hàng</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                         <button
                           onClick={() => handleEdit(product.id)}
                           className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[var(--radius-md)] transition-colors"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(product.id)} className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-[var(--radius-md)] transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-secondary/20">
           <span>Trang {page} / {totalPages} — Tổng {total} sản phẩm</span>
           <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium ${
                      page === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border hover:bg-secondary transition-colors'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Tiếp
              </button>
           </div>
        </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditProduct(null); }}
        onSuccess={fetchProducts}
        editProduct={editProduct}
      />
    </div>
  );
}
