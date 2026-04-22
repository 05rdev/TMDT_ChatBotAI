'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Search, Loader2, Filter, Star, Zap, DollarSign, ChevronDown, SlidersHorizontal, PackageX, Check, X } from 'lucide-react';
import Link from 'next/link';
import { BannerCarousel } from '@/components/BannerCarousel';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { T } from '@/components/T';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  minPrice: number;
  primaryImage: string;
  category: { id: string; name: string };
  averageRating?: number;
  totalReviews?: number;
  soldCount?: number;
}

interface Category {
  id: string;
  name: string;
}

type SortOption = 'relevant' | 'newest' | 'best_selling' | 'price_asc' | 'price_desc';



export default function ShopPage() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
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

  // Sync state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (selectedRating) params.set('minRating', String(selectedRating));
    if (page > 1) params.set('page', String(page));

    const query = params.toString();
    const newUrl = query ? `/shop?${query}` : '/shop';
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy, selectedRating, page]);

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, selectedCategory, selectedRating, sortBy]);

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
        
        {/* Horizontal Categories */}
        <div className="flex overflow-x-auto gap-4 pb-6 mb-8 custom-scrollbar scroll-smooth no-scrollbar">
          <button 
            onClick={() => {
              setSelectedCategory(null);
              setPage(1);
            }}
            className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 border ${
              selectedCategory === null 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                : 'bg-secondary/50 text-foreground/70 border-border/80 hover:border-primary/50 hover:text-foreground hover:bg-secondary'
            }`}
          >
            {t('shop.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
                setPage(1);
              }}
              className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 border ${
                selectedCategory === cat.id 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-secondary/50 text-foreground/70 border-border/80 hover:border-primary/50 hover:text-foreground hover:bg-secondary'
              }`}
            >
              <T>{cat.name}</T>
            </button>
          ))}
        </div>

        {/* Title and Sorting */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] opacity-80">Collection</p>
            <h2 className="text-4xl md:text-5xl font-heading text-foreground tracking-tighter flex items-baseline gap-4">
               {selectedCategory ? <T>{categories.find(c => c.id === selectedCategory)?.name || 'Tất cả sản phẩm'}</T> : t('shop.allCategories')}
               <span className="text-lg font-sans font-medium text-muted-foreground/40 tabular-nums">/{total}</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center space-x-3 bg-secondary/40 backdrop-blur-sm px-5 py-2.5 rounded-full border border-border/40 shadow-sm">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('shop.sortBy')}</span>
               <div className="relative">
                 <select 
                   value={sortBy} 
                   onChange={(e) => setSortBy(e.target.value as SortOption)}
                   className="appearance-none bg-transparent border-none text-foreground text-[11px] font-bold uppercase tracking-wider pr-6 focus:outline-none cursor-pointer"
                 >
                   {searchQuery && <option value="relevant">{t('shop.mostRelevant')}</option>}
                   <option value="newest">{t('shop.newest')}</option>
                   <option value="best_selling">{t('shop.bestSelling')}</option>
                   <option value="price_asc">{t('shop.priceLowHigh')}</option>
                   <option value="price_desc">{t('shop.priceHighLow')}</option>
                 </select>
                 <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
               </div>
            </div>

            <Button onClick={() => setIsMobileFiltersOpen(true)} variant="outline" className="gap-2 rounded-full px-8 py-6 h-auto border-border/60 hover:border-primary/50 text-[11px] font-bold uppercase tracking-widest w-full sm:w-auto shadow-sm transition-all duration-300">
               <SlidersHorizontal className="w-4 h-4" /> {t('shop.filter')}
            </Button>
          </div>
        </div>

        <main className="w-full space-y-6">

            {/* Products Grid */}
            {isLoading ? (
              <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">{t('shop.searching')}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="card-elevated flex flex-col items-center justify-center space-y-5 text-center p-12 rounded-[var(--radius-xl)] border border-border">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                  <PackageX className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-heading text-foreground">{t('shop.noProducts')}</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">{t('shop.noProductsDesc')}</p>
                </div>
                <Button onClick={handleClearFilters} className="rounded-full px-6 mt-2">{t('shop.clearFilters')}</Button>
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
                      {t('shop.prevPage')}
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
                      {t('shop.nextPage')}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        
      </div>

      {/* Off-canvas Filter Drawer */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         {/* Backdrop */}
         <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
         
         {/* Drawer */}
         <div className={`absolute top-0 right-0 h-full w-full max-w-[320px] bg-card border-l border-border shadow-2xl transition-transform duration-300 transform ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-heading text-foreground">{t('shop.filter')}</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
               {/* Price Filter */}
               <div className="space-y-4">
                 <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t('shop.priceRange')}</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="number" 
                        placeholder={t('shop.minPrice')} 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-background border border-border rounded-[var(--radius-md)] pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="number" 
                        placeholder={t('shop.maxPrice')} 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-background border border-border rounded-[var(--radius-md)] pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                 </div>
                 <Button onClick={() => { handleApplyPriceFilter(); setIsMobileFiltersOpen(false); }} variant="outline" className="w-full rounded-full">{t('shop.applyPrice')}</Button>
               </div>

               {/* Rating Filter */}
               <div className="space-y-4">
                 <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t('shop.rating')}</h4>
                 <div className="space-y-3">
                    {[5, 4, 3].map((rating) => (
                      <label key={rating} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center space-x-3">
                           <input 
                             type="radio" 
                             name="rating" 
                             checked={selectedRating === rating} 
                             onChange={() => { setSelectedRating(rating); setIsMobileFiltersOpen(false); }}
                             className="w-4 h-4 text-primary border-border focus:ring-primary bg-background"
                           />
                           <div className="flex items-center gap-1">
                             {renderStars(rating)}
                           </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{t('shop.andAbove')}</span>
                      </label>
                    ))}
                 </div>
               </div>
            </div>
            
            <div className="p-6 border-t border-border flex items-center gap-4 bg-secondary/20">
               <Button variant="outline" onClick={() => { handleClearFilters(); setIsMobileFiltersOpen(false); }} className="flex-1 rounded-full">{t('shop.clearAll')}</Button>
               <Button onClick={() => setIsMobileFiltersOpen(false)} className="flex-1 rounded-full text-sm">Xem {total} sản phẩm</Button>
            </div>
         </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();

  return (
    <div className="group relative bg-card border border-border/60 rounded-[28px] overflow-hidden transition-all duration-500 hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-1.5 flex flex-col h-full">
      {/* Visual Area */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-secondary/30">
        {product.primaryImage ? (
          <img 
            src={product.primaryImage} 
            alt={product.name} 
            className="object-cover w-full h-full transition-transform duration-1000 ease-out group-hover:scale-110" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}
        
        {/* Elegant overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category Badge - High Contrast Glassmorphism */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">
              <T>{product.category?.name || t('shop.other')}</T>
            </p>
          </div>
        </div>

        {/* Rating Badge - High Contrast Glassmorphism */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
            <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span className="text-[12px] font-bold text-white leading-none">
              {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>

        {/* Action Button - Floating Reveal */}
        <div className="absolute bottom-6 right-6 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
           <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
              <Zap className="w-6 h-6 fill-current" />
           </div>
        </div>
      </Link>

      {/* Detail Area */}
      <div className="p-7 flex flex-col flex-1 gap-5 bg-card">
        <div className="space-y-3 flex-1">
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-lg font-semibold text-foreground leading-[1.4] tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
              <T>{product.name}</T>
            </h3>
          </Link>
          
          <div className="flex items-center gap-2">
             <div className="h-1 w-1 rounded-full bg-primary/40" />
             <span className="text-[12px] text-muted-foreground font-medium tracking-wide">
               {t('shop.sold', { count: product.soldCount || 0 })}
             </span>
          </div>
        </div>

        <div className="flex items-end justify-between pt-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">Price</span>
            <span className="text-2xl font-heading text-foreground tracking-tight leading-none">
              {product.minPrice ? `${product.minPrice.toLocaleString('vi-VN')}đ` : t('shop.contact')}
            </span>
          </div>
          
          <Link href={`/product/${product.slug}`} className="text-xs font-bold text-primary uppercase tracking-widest border-b-2 border-primary/0 hover:border-primary transition-all pb-0.5">
             Details
          </Link>
        </div>
      </div>
    </div>
  );
}
