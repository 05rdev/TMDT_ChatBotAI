'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Loader2, Star, ChevronDown, SlidersHorizontal, PackageX, X, ShoppingCart, Eye, Flame, Sparkles, ArrowUpDown, Check } from 'lucide-react';
import Link from 'next/link';
import { BannerCarousel } from '@/components/BannerCarousel';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { T } from '@/components/T';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

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
  createdAt?: string;
  variants?: { id: string; price: number; stock: number }[];
}

interface Category {
  id: string;
  name: string;
}

type SortOption = 'relevant' | 'newest' | 'best_selling' | 'price_asc' | 'price_desc';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const limit = 16;

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // Chỉ ưu tiên kết quả Visual Search nếu không có bộ lọc chủ động nào khác (Category hoặc Search Text)
    const isVisualMode = searchParams.get('visual') === 'true';
    const hasActiveFilters = !!(searchQuery || selectedCategory);

    if (isVisualMode && !hasActiveFilters) {
      const storedResults = sessionStorage.getItem('visual_search_results');
      if (storedResults) {
        try {
          const products = JSON.parse(storedResults);
          setProducts(formatProducts(products));
          setIsLoading(false);
          setTotal(products.length);
          setTotalPages(1);
          return;
        } catch (err) {
          console.error('Failed to parse visual search results', err);
        }
      }
    }
    
    // Nếu có bộ lọc mới hoặc không ở chế độ Visual, tải sản phẩm bình thường
    fetchProducts();
  }, [page, searchQuery, selectedCategory, selectedRating, sortBy, searchParams.get('visual'), searchParams.get('t')]);

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
    sessionStorage.removeItem('visual_search_results');
    router.push('/shop');
  };

  const activeFilterCount = [selectedCategory, minPrice, maxPrice, selectedRating].filter(Boolean).length;

  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'text-orange-400 fill-orange-400' : 'text-muted-foreground/30'}`} />
    ));
  };

  // Filter sidebar content - reusable for both desktop & mobile
  const FilterContent = () => (
    <div className="space-y-7">
      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{'Danh mục'}</h4>
        <div className="space-y-1">
          <button
            onClick={() => { setSelectedCategory(null); setPage(1); }}
            className={`w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            {t('shop.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setSearchQuery(''); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <T>{cat.name}</T>
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{t('shop.priceRange')}</h4>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder={t('shop.minPrice')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="number"
              placeholder={t('shop.maxPrice')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-background border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <Button
            onClick={() => { handleApplyPriceFilter(); setIsMobileFiltersOpen(false); }}
            variant="outline"
            className="w-full rounded-[var(--radius-md)] text-xs h-9"
          >
            {t('shop.applyPrice')}
          </Button>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{t('shop.rating')}</h4>
        <div className="space-y-2">
          {[5, 4, 3].map((rating) => (
            <label key={rating} className="flex items-center justify-between cursor-pointer group px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-secondary/40 transition-colors">
              <div className="flex items-center space-x-2.5">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => { setSelectedRating(rating); setIsMobileFiltersOpen(false); }}
                  className="w-3.5 h-3.5 text-primary border-border focus:ring-primary bg-background accent-primary"
                />
                <div className="flex items-center gap-0.5">
                  {renderStars(rating)}
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">{t('shop.andAbove')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={() => { handleClearFilters(); setIsMobileFiltersOpen(false); }}
          className="w-full rounded-[var(--radius-md)] text-xs h-9 border-danger/30 text-danger hover:bg-danger/5"
        >
          {t('shop.clearAll')} ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in-up">
      {/* Hero Banner Area */}
      <section className="mb-4">
        <BannerCarousel height="h-[260px] md:h-[360px]" />
      </section>

      {/* Main Shop Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Bar: Title + Sort + Filter Toggle */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] opacity-80">Collection</p>
            <h2 className="text-3xl md:text-4xl font-heading text-foreground tracking-tighter flex items-baseline gap-3">
              {selectedCategory ? <T>{categories.find(c => c.id === selectedCategory)?.name || 'Tất cả sản phẩm'}</T> : t('shop.allCategories')}
              <span className="text-base font-sans font-medium text-muted-foreground/40 tabular-nums">/{total}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center space-x-2 bg-card border border-border px-4 py-2 rounded-[var(--radius-md)] shadow-sm hover:bg-secondary/50 transition-all"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground text-sm font-medium pr-1 whitespace-nowrap">
                  {t(`shop.${sortBy === 'relevant' ? 'mostRelevant' : sortBy === 'newest' ? 'newest' : sortBy === 'best_selling' ? 'bestSelling' : sortBy === 'price_asc' ? 'priceLowHigh' : 'priceHighLow'}`)}
                </span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 card-elevated rounded-[var(--radius-lg)] overflow-hidden z-50 shadow-xl animate-fade-in-up">
                  <div className="px-4 py-2.5 border-b border-border bg-secondary/30">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('shop.sortBy')}</span>
                  </div>
                  <div className="p-1.5">
                    {[
                      ...(searchQuery ? [{ value: 'relevant', label: t('shop.mostRelevant') }] : []),
                      { value: 'newest', label: t('shop.newest') },
                      { value: 'best_selling', label: t('shop.bestSelling') },
                      { value: 'price_asc', label: t('shop.priceLowHigh') },
                      { value: 'price_desc', label: t('shop.priceHighLow') },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as SortOption);
                          setIsSortDropdownOpen(false);
                          setPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-[var(--radius-md)] transition-all ${
                          sortBy === option.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary text-foreground'
                        }`}
                      >
                        {option.label}
                        {sortBy === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              onClick={() => setIsMobileFiltersOpen(true)}
              variant="outline"
              className="lg:hidden gap-2 rounded-[var(--radius-md)] px-4 py-2 h-auto border-border shadow-sm relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">{t('shop.filter')}</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Content: Sidebar + Products */}
        <div className="flex gap-8">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="sticky top-24 card-elevated bg-card p-5 rounded-[var(--radius-xl)] border border-border">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  {t('shop.filter')}
                </h3>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
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
      </div>

      {/* Off-canvas Filter Drawer (Mobile) */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />

        {/* Drawer */}
        <div className={`absolute top-0 right-0 h-full w-full max-w-[320px] bg-card border-l border-border shadow-2xl transition-transform duration-300 transform ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">{t('shop.filter')}</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
            <FilterContent />
          </div>

          <div className="p-5 border-t border-border bg-secondary/20">
            <Button onClick={() => setIsMobileFiltersOpen(false)} className="w-full rounded-[var(--radius-md)] text-sm">
              {`Xem ${total} sản phẩm`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Smart badges
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isHot = (product.soldCount || 0) >= 10;
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const isOutOfStock = totalStock <= 0;

  const handleQuickAddCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!user) {
      toast.error('Vui lòng đăng nhập');
      router.push('/login');
      return;
    }
    try {
      const variant = product.variants?.[0];
      if (!variant) {
        toast.error('Sản phẩm chưa có phiên bản');
        return;
      }
      await api.post('/cart', {
        productId: product.id,
        productVariantId: variant.id,
        quantity: 1
      });
      await fetchCart();
      toast.success('Đã thêm vào giỏ hàng');
    } catch {
      toast.error('Không thể thêm vào giỏ');
    }
  };

  return (
    <div
      className={`group relative bg-card border border-border/50 rounded-[var(--radius-xl)] overflow-hidden transition-all duration-400 hover:shadow-lg hover:shadow-black/[0.06] dark:hover:shadow-black/[0.25] hover:-translate-y-1 flex flex-col h-full cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Area */}
      <div className="relative block aspect-square overflow-hidden bg-secondary/30">
        <Link href={`/product/${product.slug}`} className="block w-full h-full z-10">
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.name}
              className={`object-cover w-full h-full transition-transform duration-700 ease-out ${!isOutOfStock ? 'group-hover:scale-108' : ''}`}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <PackageX className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </Link>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
            <span className="px-4 py-2 bg-rose-600 text-white text-sm font-bold uppercase tracking-wider rounded-full shadow-lg border-2 border-white/20">
              Hết hàng
            </span>
          </div>
        )}

        {/* Hover overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
        )}

        {/* Smart Badges - Top Left */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              <Sparkles className="w-3 h-3" />
              New
            </span>
          )}
          {isHot && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-danger text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              <Flame className="w-3 h-3" />
              Hot
            </span>
          )}
        </div>

        {/* Rating Badge - Top Right */}
        {(product.averageRating || 0) > 0 && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md shadow-sm">
              <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
              <span className="text-[11px] font-bold text-white leading-none">
                {(product.averageRating || 0).toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions - Bottom on hover */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 z-20 flex gap-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleQuickAddCart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-[var(--radius-md)] hover:bg-primary-hover active:scale-[0.97] transition-all shadow-md"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{'Thêm giỏ'}</span>
            </button>
            <Link
              href={`/product/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 flex items-center justify-center bg-white/90 dark:bg-card/90 backdrop-blur-sm text-foreground rounded-[var(--radius-md)] hover:bg-white dark:hover:bg-card transition-all shadow-md"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 gap-2">
        {/* Category */}
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <T>{product.category?.name || t('shop.other')}</T>
        </span>

        {/* Name */}
        <Link href={`/product/${product.slug}`} className="block flex-1">
          <h3 className={`text-sm font-semibold text-foreground leading-snug tracking-tight transition-colors duration-300 line-clamp-2 ${!isOutOfStock ? 'group-hover:text-primary' : ''}`}>
            <T>{product.name}</T>
          </h3>
        </Link>

        {/* Bottom: Price + Sold */}
        <div className="flex items-end justify-between mt-auto pt-1">
          <div>
            <span className="text-lg font-bold text-foreground leading-none tracking-tight">
              {product.minPrice ? `${product.minPrice.toLocaleString('vi-VN')}đ` : t('shop.contact')}
            </span>
          </div>
          {(product.soldCount || 0) > 0 && (
            <span className="text-[11px] text-muted-foreground font-medium">
              {t('shop.sold', { count: product.soldCount || 0 })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
