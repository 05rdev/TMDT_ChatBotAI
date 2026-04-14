'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { Search, SlidersHorizontal, Grid, List as ListIcon, Loader2, Sparkles, Filter, Bot, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  minPrice: number;
  primaryImage: string;
  category: { name: string };
  similarity?: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      const formattedProducts = (productsRes.data.data || []).map((p: any) => ({
        ...p,
        primaryImage: p.images?.[0]?.url,
        minPrice: p.variants?.[0]?.price
      }));
      setProducts(formattedProducts);
      setCategories(categoriesRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch shop data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      fetchInitialData();
      return;
    }

    try {
      setIsSearching(true);
      // Thay đổi từ AI Search sang Keyword Search thông thường theo yêu cầu
      const response = await api.get(`/products?search=${encodeURIComponent(searchQuery)}`);
      
      const formattedProducts = (response.data.data || []).map((p: any) => ({
        ...p,
        primaryImage: p.images?.[0]?.url,
        minPrice: p.variants?.[0]?.price
      }));
      setProducts(formattedProducts);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Search */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Cửa hàng</h1>
            <p className="text-slate-400">Khám phá bộ sưu tập sản phẩm mới nhất của chúng tôi</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span className="flex items-center"><Grid className="w-4 h-4 mr-1 text-emerald-500" /> Lưới</span>
            <div className="w-[1px] h-4 bg-white/10 mx-2" />
            <span className="flex items-center"><ListIcon className="w-4 h-4 mr-1" /> Danh sách</span>
          </div>
        </div>

        {/* Semantic Search Bar */}
        <form onSubmit={handleSearch} className="relative group max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-xl group-focus-within:bg-emerald-500/10 transition-colors" />
          <div className="relative glass-card p-2 rounded-2xl flex items-center space-x-2 overflow-hidden border-white/10">
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-foreground placeholder:text-slate-500 py-3"
              placeholder="Bạn đang tìm gì? Thử 'áo thun nam trắng dưới 300k'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit"
              className="px-6" 
              isLoading={isSearching}
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Tìm bằng AI
            </Button>
          </div>
        </form>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-8">
            {/* Category Filter */}
            <div className="sidebar-section">
              <div className="flex items-center justify-between">
                <h3 className="sidebar-title"><Filter className="w-4 h-4 mr-2 text-emerald-500" /> Danh mục</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground hover:text-emerald-500">Xóa</Button>
              </div>
              <div className="space-y-3 pt-2">
                {categories.map((cat) => (
                  <label 
                    key={cat.id} 
                    className="flex items-center group cursor-pointer"
                  >
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer h-5 w-5 appearance-none rounded-md border border-border bg-background checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" 
                      />
                      <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-3 text-sm text-foreground/70 group-hover:text-emerald-500 transition-colors">
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="sidebar-section">
              <h3 className="sidebar-title"><SlidersHorizontal className="w-4 h-4 mr-2 text-emerald-500" /> Khoảng giá</h3>
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Từ</span>
                      <div className="relative">
                        <input type="number" placeholder="0" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                        <span className="absolute right-3 top-2 text-xs text-muted-foreground">đ</span>
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Đến</span>
                      <div className="relative">
                        <input type="number" placeholder="15M" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                        <span className="absolute right-3 top-2 text-xs text-muted-foreground">đ</span>
                      </div>
                   </div>
                </div>
                
                <div className="space-y-2">
                   <input type="range" className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500" min="0" max="20000000" />
                   <div className="flex justify-between text-[10px] font-medium text-muted-foreground px-1">
                      <span>0đ</span>
                      <span>20.000.000đ</span>
                   </div>
                </div>

                <Button className="w-full rounded-xl py-6 font-bold shadow-emerald-500/10">Áp dụng lọc</Button>
              </div>
            </div>

            {/* AI Assistant Banner */}
            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
               <h4 className="font-bold flex items-center text-sm mb-2">
                 <Sparkles className="w-4 h-4 mr-2 text-emerald-500" /> Bạn thấy khó chọn?
               </h4>
               <p className="text-xs text-muted-foreground leading-relaxed mb-4">Để AI của chúng tôi tư vấn món đồ phù hợp nhất với phong cách và ngân sách của bạn.</p>
               <Button size="sm" variant="outline" className="w-full text-xs h-9 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">Hỏi AI ngay</Button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-slate-500 animate-pulse">Đang tải danh sách sản phẩm...</p>
            </div>
          ) : (products?.length === 0) ? (
            <div className="h-[400px] glass-card rounded-2xl flex flex-col items-center justify-center space-y-4 text-center p-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                 <Search className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold">Không tìm thấy sản phẩm</h3>
              <p className="text-slate-400 max-w-sm">Dạ, hiện tại em chưa tìm thấy sản phẩm nào khớp với yêu cầu của anh/chị. Anh/chị thử thay đổi từ khóa nhé!</p>
              <Button variant="outline" onClick={fetchInitialData}>Hiện tất cả sản phẩm</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="glass-card rounded-[1.5rem] border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all hover:-translate-y-2">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
        {/* Placeholder for Product Image */}
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
           {product.primaryImage ? (
             <img src={product.primaryImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
           ) : (
             <Bot className="w-12 h-12 text-slate-700" />
           )}
        </div>
        
        {/* Similarity Badge (if search result) */}
        {product.similarity && (
          <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            Độ chính xác: {Math.round(product.similarity * 100)}%
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
      
      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">{product.category.name}</p>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">{product.name}</h3>
          </Link>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-white">
            {product.minPrice ? `${product.minPrice.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </span>
          <Button size="sm" className="rounded-full w-10 h-10 p-0">
             <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
