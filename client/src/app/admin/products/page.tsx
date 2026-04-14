'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  ArrowUpDown,
  Image as ImageIcon
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Quản lý sản phẩm</h1>
            <p className="text-slate-400 text-sm">Thêm, sửa và quản lý kho hàng của bạn.</p>
         </div>
         <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm mới
         </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border-white/5">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="Tìm tên sản phẩm, slug..."
            />
         </div>
         <div className="flex items-center space-x-2 w-full md:w-auto">
            <Button variant="ghost" size="sm" className="flex-1 md:flex-none">
               <Filter className="w-4 h-4 mr-2" /> Lọc
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 md:flex-none">
               <ArrowUpDown className="w-4 h-4 mr-2" /> Sắp xếp
            </Button>
         </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-[2rem] border-white/5 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Sản phẩm</th>
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Danh mục</th>
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Giá sàn</th>
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                       <td colSpan={5} className="px-6 py-20 text-center text-slate-500 animate-pulse italic">
                          Đang tải dữ liệu sản phẩm...
                       </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                          Chưa có sản phẩm nào trong kho.
                       </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                       <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                             <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-slate-800 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
                                   {product.primaryImage ? (
                                     <img src={product.primaryImage} className="w-full h-full object-cover" alt={product.name} />
                                   ) : (
                                     <ImageIcon className="w-5 h-5 text-slate-600" />
                                   )}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-200 line-clamp-1">{product.name}</p>
                                   <p className="text-[10px] text-slate-500 font-mono">ID: {product.id.substring(0, 8)}...</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-xs font-medium text-slate-400">{product.category.name}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-bold text-emerald-500">{product.minPrice?.toLocaleString('vi-VN')}đ</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                                ACTIVE
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end space-x-1">
                                <button className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-500 hover:text-emerald-400 transition-all">
                                   <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-500 hover:text-emerald-400 transition-all">
                                   <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>

         {/* Pagination Footer */}
         <div className="p-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-500">Hiển thị <span className="text-slate-300 font-bold">{products.length}</span> sản phẩm</p>
            <div className="flex items-center space-x-2">
               <Button variant="ghost" size="sm" disabled>Trước</Button>
               <div className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20">1</div>
               <Button variant="ghost" size="sm" disabled>Sau</Button>
            </div>
         </div>
      </div>
    </div>
  );
}
