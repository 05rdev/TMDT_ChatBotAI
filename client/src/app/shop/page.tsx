'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { Search, Grid, List as ListIcon, Loader2, Sparkles, Filter, Bot, Zap, DollarSign, Mic, Camera } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  minPrice: number;
  primaryImage: string;
  category: { id: string; name: string };
  similarity?: number;
}

interface Category {
  id: string;
  name: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]); // Fetch when category changes

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchProducts = async (isSearchSubmit = false) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      if (selectedCategory) queryParams.append('categoryId', selectedCategory);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);

      const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      
      const formattedProducts = (response.data.data || []).map((p: any) => ({
        ...p,
        primaryImage: p.images?.[0]?.url,
        minPrice: p.variants?.[0]?.price
      }));
      setProducts(formattedProducts);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(true);
  };

  const handleApplyFilters = () => {
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setTimeout(() => fetchProducts(), 0);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Search */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-foreground pb-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase text-foreground">Cửa hàng</h1>
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Khám phá bộ sưu tập sản phẩm mới nhất</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-4 py-2 border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
            <button className="flex items-center hover:text-foreground transition-colors"><Grid className="w-4 h-4 mr-2" /> Lưới</button>
            <div className="w-[2px] h-4 bg-foreground mx-3" />
            <button className="flex items-center hover:text-foreground transition-colors"><ListIcon className="w-4 h-4 mr-2" /> Danh sách</button>
          </div>
        </div>


      </section>

      {/* Top Filters Section */}
      <section className="solid-card p-6 bg-accent border-4 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-xl uppercase tracking-tighter flex items-center">
            <Filter className="w-5 h-5 mr-2" /> Bộ lọc
          </h3>
          <button 
            onClick={handleClearFilters}
            className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 hover:underline underline-offset-4 transition-all"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Danh mục</span>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 border-2 text-sm font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === null 
                    ? 'bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] -translate-y-0.5' 
                    : 'bg-background text-foreground border-foreground hover:bg-secondary hover:shadow-[2px_2px_0px_0px_var(--foreground)] hover:-translate-y-0.5'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 border-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] -translate-y-0.5' 
                      : 'bg-background text-foreground border-foreground hover:bg-secondary hover:shadow-[2px_2px_0px_0px_var(--foreground)] hover:-translate-y-0.5'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Khoảng giá (VND)</span>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground"><DollarSign className="w-4 h-4" /></span>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border-2 border-foreground font-bold text-sm focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                />
              </div>
              <span className="font-bold">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground"><DollarSign className="w-4 h-4" /></span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border-2 border-foreground font-bold text-sm focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                />
              </div>
              <Button onClick={handleApplyFilters} className="px-4 py-2" variant="default">Lọc</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div>
        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-bold text-xl uppercase tracking-widest animate-pulse">Đang tải dữ liệu...</p>
          </div>
        ) : (products?.length === 0) ? (
          <div className="h-[400px] solid-card bg-background flex flex-col items-center justify-center space-y-6 text-center p-8">
            <div className="w-20 h-20 bg-accent border-4 border-foreground rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_var(--foreground)]">
               <Search className="w-10 h-10 text-foreground" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter">Không tìm thấy sản phẩm</h3>
            <p className="text-muted-foreground font-bold max-w-md uppercase tracking-wider">Dạ, hiện tại chưa có sản phẩm nào khớp với yêu cầu lọc của bạn. Hãy thử thay đổi tiêu chí!</p>
            <Button size="lg" onClick={handleClearFilters}>Xóa bộ lọc</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="solid-card bg-background flex flex-col group hover:-translate-y-2 transition-transform cursor-pointer relative">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] border-b-2 border-foreground overflow-hidden bg-secondary">
        {product.primaryImage ? (
          <img src={product.primaryImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Bot className="w-16 h-16 text-muted-foreground opacity-50" />
          </div>
        )}
        
        {/* Similarity Badge (if search result) */}
        {product.similarity && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground border-2 border-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-[2px_2px_0px_0px_var(--foreground)]">
            Match: {Math.round(product.similarity * 100)}%
          </div>
        )}
      </Link>
      
      <div className="p-5 space-y-4 flex flex-col flex-1">
        <div className="space-y-2 flex-1">
          <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground bg-accent px-2 py-1 inline-block border border-foreground">
            {product.category?.name || 'Chưa phân loại'}
          </p>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-black text-lg text-foreground uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="flex items-end justify-between pt-4 border-t-2 border-foreground border-dashed">
          <span className="text-2xl font-black text-foreground">
            {product.minPrice ? `${product.minPrice.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </span>
          <Button size="sm" className="px-3 py-2 border-2 shadow-[2px_2px_0px_0px_var(--foreground)] active:shadow-none active:translate-y-[2px]">
             <Zap className="w-4 h-4 mr-1" /> Mua
          </Button>
        </div>
      </div>
    </div>
  );
}
