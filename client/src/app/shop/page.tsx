'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Search, Loader2, Filter, Star, Zap, DollarSign, ChevronDown, SlidersHorizontal, PackageX, Check } from 'lucide-react';
import Link from 'next/link';
import { BannerCarousel } from '@/components/BannerCarousel';
import { useSearchParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  minPrice: number;
  primaryImage: string;
  category: { id: string; name: string };
  rating?: number;
  soldCount?: number;
}

interface Category {
  id: string;
  name: string;
}

type SortOption = 'relevant' | 'newest' | 'best_selling' | 'price_asc' | 'price_desc';



export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Update search query when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);



  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // When filters change, reset page to 1
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedRating, sortBy]);

  // Separate effect for page changes so it doesn't reset to page 1
  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const formatProducts = (data: any[]): Product[] => {
    return data.map((p: any) => ({
      ...p,
      primaryImage: p.primaryImage || p.images?.[0]?.url,
      minPrice: p.minPrice || (p.variants?.[0]?.price ? Number(p.variants[0].price) : 0),
      rating: p.rating || 5, // Default to 5 stars if no reviews
      soldCount: p.soldCount || 0
    }));
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();

      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      if (selectedCategory) queryParams.append('categoryId', selectedCategory);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      
      // Map sort options to API logic (assuming backend handles these, or we handle via UI sorting if backend doesn't support yet)
      if (sortBy === 'price_asc') queryParams.append('sort', 'price_asc');
      if (sortBy === 'price_desc') queryParams.append('sort', 'price_desc');
      if (sortBy === 'newest') queryParams.append('sort', 'newest');
      if (sortBy === 'best_selling') queryParams.append('sort', 'best_selling');
      if (selectedRating) queryParams.append('minRating', String(selectedRating));

      const url = `/products?${queryParams.toString()}`;
      const response = await api.get(url);

      let formattedProducts = formatProducts(response.data.data || []);

      // Client-side fallback sorting if backend doesn't support the sort param yet
      if (sortBy === 'price_asc') formattedProducts.sort((a, b) => a.minPrice - b.minPrice);
      if (sortBy === 'price_desc') formattedProducts.sort((a, b) => b.minPrice - a.minPrice);
      if (sortBy === 'best_selling') formattedProducts.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

      setProducts(formattedProducts);

      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPriceFilter = () => {
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating(null);
    setSearchQuery('');
    setSortBy('newest');
    setPage(1);
  };

  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'text-orange-400 fill-orange-400' : 'text-muted-foreground'}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in-up">
      {/* Hero Banner Area */}
      <section className="mb-4">
        <BannerCarousel height="h-[300px] md:h-[400px]" />
      </section>

      {/* Main Shop Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-border">
           <Button onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)} variant="outline" className="gap-2 rounded-full">
             <SlidersHorizontal className="w-4 h-4" /> Bộ lọc & Phân loại
           </Button>
           <span className="text-sm font-medium text-muted-foreground">{total} sản phẩm</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className={`lg:w-64 shrink-0 space-y-8 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-border">
               <h3 className="font-heading text-lg text-foreground flex items-center"><Filter className="w-4 h-4 mr-2" /> Bộ Lọc</h3>
               <button onClick={handleClearFilters} className="text-xs font-semibold text-danger hover:underline">Xóa tất cả</button>
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Danh mục</h4>
              <div className="space-y-2">
                 <label className="flex items-center space-x-3 cursor-pointer group">
                   <input 
                     type="radio" 
                     name="category" 
                     checked={selectedCategory === null} 
                     onChange={() => setSelectedCategory(null)}
                     className="w-4 h-4 text-primary border-border focus:ring-primary bg-background"
                   />
                   <span className={`text-sm group-hover:text-primary transition-colors ${selectedCategory === null ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                     Tất cả danh mục
                   </span>
                 </label>
                 {categories.map((cat) => (
                   <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group">
                     <input 
                       type="radio" 
                       name="category" 
                       checked={selectedCategory === cat.id} 
                       onChange={() => setSelectedCategory(cat.id)}
                       className="w-4 h-4 text-primary border-border focus:ring-primary bg-background"
                     />
                     <span className={`text-sm group-hover:text-primary transition-colors ${selectedCategory === cat.id ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                       {cat.name}
                     </span>
                   </label>
                 ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Khoảng Giá</h4>
              <div className="grid grid-cols-2 gap-3">
                 <div className="relative">
                   <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                   <input 
                     type="number" 
                     placeholder="Tối thiểu" 
                     value={minPrice}
                     onChange={(e) => setMinPrice(e.target.value)}
                     className="w-full bg-secondary/50 border border-border rounded-[var(--radius-md)] pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors"
                   />
                 </div>
                 <div className="relative">
                   <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                   <input 
                     type="number" 
                     placeholder="Tối đa" 
                     value={maxPrice}
                     onChange={(e) => setMaxPrice(e.target.value)}
                     className="w-full bg-secondary/50 border border-border rounded-[var(--radius-md)] pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors"
                   />
                 </div>
              </div>
              <Button onClick={handleApplyPriceFilter} variant="outline" className="w-full rounded-full text-xs">Áp dụng giá</Button>
            </div>

            {/* Rating Filter */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Đánh Giá</h4>
              <div className="space-y-2.5">
                 {[5, 4, 3].map((rating) => (
                   <label key={rating} className="flex items-center justify-between cursor-pointer group">
                     <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          name="rating" 
                          checked={selectedRating === rating} 
                          onChange={() => setSelectedRating(rating)}
                          className="w-4 h-4 text-primary border-border focus:ring-primary bg-background"
                        />
                        <div className="flex items-center gap-1">
                          {renderStars(rating)}
                        </div>
                     </div>
                     <span className="text-[10px] text-muted-foreground">trở lên</span>
                   </label>
                 ))}
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: PRODUCTS LIST */}
          <main className="flex-1 space-y-6">
            
            {/* Top Sorting Bar */}
            <div className="hidden lg:flex items-center justify-between bg-card border border-border rounded-[var(--radius-xl)] p-3 px-5 shadow-sm">
               <p className="text-sm font-medium text-foreground">
                 Tìm thấy <strong className="text-primary">{total}</strong> sản phẩm
                 {searchQuery && <span> cho từ khóa <strong className="italic">"{searchQuery}"</strong></span>}
               </p>
               <div className="flex items-center space-x-3">
                 <span className="text-sm text-muted-foreground">Sắp xếp theo:</span>
                 <div className="relative">
                   <select 
                     value={sortBy} 
                     onChange={(e) => setSortBy(e.target.value as SortOption)}
                     className="appearance-none bg-secondary/50 border border-border text-foreground text-sm font-medium rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-primary cursor-pointer transition-colors"
                   >
                     {searchQuery && <option value="relevant">Liên quan nhất</option>}
                     <option value="newest">Hàng mới nhất</option>
                     <option value="best_selling">Bán chạy nhất</option>
                     <option value="price_asc">Giá: Thấp đến Cao</option>
                     <option value="price_desc">Giá: Cao đến Thấp</option>
                   </select>
                   <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                 </div>
               </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Đang tìm kiếm sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="card-elevated flex flex-col items-center justify-center space-y-5 text-center p-12 rounded-[var(--radius-xl)] border border-border">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                  <PackageX className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-heading text-foreground">Không tìm thấy sản phẩm</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">Thật tiếc! Chúng tôi không tìm thấy sản phẩm nào khớp với bộ lọc của bạn. Vui lòng thay đổi tiêu chí hoặc xóa bộ lọc để xem thêm.</p>
                </div>
                <Button onClick={handleClearFilters} className="rounded-full px-6 mt-2">Xóa toàn bộ lọc</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium hover:bg-secondary disabled:opacity-40 transition-all text-foreground"
                    >
                      Trang trước
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-full text-sm font-semibold transition-all flex items-center justify-center ${
                            page === pageNum
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-card border border-border text-foreground hover:bg-secondary'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium hover:bg-secondary disabled:opacity-40 transition-all text-foreground"
                    >
                      Trang tiếp
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card-elevated-hover bg-card flex flex-col group cursor-pointer relative overflow-hidden rounded-[var(--radius-xl)] border border-border transition-all duration-300">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-secondary">
        {product.primaryImage ? (
          <img src={product.primaryImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}
        
        {/* Subtle overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="p-5 space-y-3 flex flex-col flex-1 relative z-10 bg-card">
        <div className="space-y-2 flex-1">
          <div className="flex justify-between items-start">
             <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
               {product.category?.name || 'Khác'}
             </p>
             {/* Render Stars */}
             <div className="flex items-center gap-0.5">
               <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
               <span className="text-[11px] font-bold text-foreground">{product.rating}</span>
             </div>
          </div>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center text-[11px] text-muted-foreground font-medium">
             Đã bán {product.soldCount || 0}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border">
          <span className="text-lg font-heading text-foreground">
            {product.minPrice ? `${product.minPrice.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </span>
          <Link href={`/product/${product.slug}`}>
            <Button size="sm" className="rounded-full w-9 h-9 p-0 flex items-center justify-center bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground shadow-none">
              <Zap className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
