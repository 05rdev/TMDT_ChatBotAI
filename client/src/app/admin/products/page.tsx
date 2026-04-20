'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock Data
const mockProducts = [
  { id: '1', name: 'Sleek Granite Chair', price: 3500000, category: 'Furniture', stock: 12, status: 'Active' },
  { id: '2', name: 'Smart AI Speaker Model X', price: 1520000, category: 'Electronics', stock: 0, status: 'Out of Stock' },
  { id: '3', name: 'Hương thơm thiên nhiên', price: 650000, category: 'Home Decor', stock: 45, status: 'Active' },
  { id: '4', name: 'Led Light Strip 5M', price: 320000, category: 'Electronics', stock: 100, status: 'Active' }
];

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Sản phẩm</h1>
          <p className="text-sm text-muted-foreground mt-1">Danh mục kiểm soát toàn bộ hàng hóa trên UltraShop.</p>
        </div>
        <Button className="flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Thêm sản phẩm mới
        </Button>
      </div>

      <div className="glass-card p-4 rounded-2xl border-border flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-foreground"
          />
        </div>
        
        <Button variant="outline" className="flex items-center bg-background border-border">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Lọc
        </Button>
      </div>

      {/* Table Data */}
      <div className="glass-card rounded-2xl border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Danh mục</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Giá bán</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Tồn kho</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap">Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    #{product.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-500 whitespace-nowrap">
                    {product.price.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      product.stock > 0 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {product.stock > 0 ? 'Hoạt động' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                       <button className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors">
                         <Edit className="w-4 h-4" />
                       </button>
                       <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                         <Trash2 className="w-4 h-4" />
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
           <span>Hiển thị 1 - 4 của 152 sản phẩm</span>
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
