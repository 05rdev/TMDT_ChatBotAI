'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { BannerCarousel } from '@/components/BannerCarousel';
import { useTranslation } from '@/hooks/useTranslation';
import { T } from '@/components/T';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Loader2, Star, PackageX, ShoppingCart, Eye,
  Flame, Sparkles, ArrowRight, TrendingUp, Clock, Award,
} from 'lucide-react';

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
  image?: string;
}

const formatProducts = (data: any[]): Product[] => {
  return data.map((p: any) => ({
    ...p,
    primaryImage: p.primaryImage || p.images?.[0]?.url,
    minPrice: p.minPrice || (p.variants?.[0]?.price ? Number(p.variants[0].price) : 0),
    soldCount: p.soldCount || 0,
  }));
};

export default function HomePage() {
  const { t } = useTranslation();
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const lastRefreshAtRef = useRef(0);

  const fetchHomeData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [newRes, bestRes, allRes, catRes] = await Promise.all([
        api.get('/products?sort=newest&limit=8'),
        api.get('/products?sort=best_selling&limit=8'),
        api.get('/products?limit=12'),
        api.get('/categories'),
      ]);

      setNewProducts(formatProducts(newRes.data.data || []));

      const bestData = formatProducts(bestRes.data.data || []);
      bestData.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      setBestSellers(bestData);

      setAllProducts(formatProducts(allRes.data.data || []));
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch homepage data', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHomeData();
  }, [fetchHomeData]);

  useEffect(() => {
    const refreshVisiblePage = () => {
      const now = Date.now();
      if (document.visibilityState === 'visible' && now - lastRefreshAtRef.current > 30000) {
        lastRefreshAtRef.current = now;
        void fetchHomeData(false);
      }
    };

    window.addEventListener('focus', refreshVisiblePage);
    window.addEventListener('pageshow', refreshVisiblePage);
    document.addEventListener('visibilitychange', refreshVisiblePage);

    return () => {
      window.removeEventListener('focus', refreshVisiblePage);
      window.removeEventListener('pageshow', refreshVisiblePage);
      document.removeEventListener('visibilitychange', refreshVisiblePage);
    };
  }, [fetchHomeData]);

  // Featured = products with highest rating
  const featuredProducts = [...allProducts]
    .filter(p => (p.averageRating || 0) > 0)
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 8);

  // Fallback: if no rated products, use all products as featured
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in-up">
      {/* Hero Banner - Container Width */}
      <section className="page-shell pt-4 sm:pt-6 md:pt-8">
        <BannerCarousel height="h-[220px] sm:h-[320px] md:h-[400px] lg:h-[440px]" />
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="page-shell py-8 md:py-12">
          {/* Section Header */}
          <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] block">Danh mục</span>
                <h2 className="text-lg md:text-xl font-heading text-foreground tracking-tight">Khám phá theo danh mục</h2>
              </div>
            </div>
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors group"
            >
              Tất cả
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Category Cards - Horizontal scroll on mobile, grid on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, index) => {
              const categoryIcons: Record<string, string> = {
                'laptop': '💻', 'máy tính bảng': '📱', 'điện thoại': '📲',
                'màn hình': '🖥️', 'linh kiện máy tính': '⚙️', 'thiết bị điều khiển': '🎮',
                'đồng hồ thông minh': '⌚', 'gaming gear': '🎯', 'tai nghe': '🎧',
                'bàn phím': '⌨️', 'chuột': '🖱️', 'loa': '🔊', 'máy ảnh': '📷',
                'phụ kiện': '🔌', 'tivi': '📺', 'máy in': '🖨️',
              };
              const iconEmoji = Object.entries(categoryIcons).find(
                ([key]) => cat.name.toLowerCase().includes(key)
              )?.[1] || '📦';

              return (
                <Link
                  key={cat.id}
                  href={`/shop?categoryId=${cat.id}`}
                  className="group relative min-w-0"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                   <div className="relative overflow-hidden rounded-[8px] border border-border/60 bg-card transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/[0.08] group-hover:-translate-y-1">
                    {/* Background Gradient Accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Content */}
                     <div className="relative p-4 sm:p-5 flex flex-col items-center text-center gap-3">
                      {/* Category Image */}
                      <div className="relative">
                         <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[8px] bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/10">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-2xl sm:text-3xl transition-transform duration-400 group-hover:scale-110">
                              {iconEmoji}
                            </span>
                          )}
                        </div>
                        {/* Floating dot indicator */}
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
                      </div>

                      {/* Category Name */}
                      <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                        <T>{cat.name}</T>
                      </span>

                      {/* Hover Arrow Indicator */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        <span className="text-[10px] font-medium text-primary/70">Xem</span>
                        <ArrowRight className="w-3 h-3 text-primary/70" />
                      </div>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile View All */}
          <div className="sm:hidden flex justify-center mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-all"
            >
              Xem tất cả danh mục
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* New Products Section */}
      {newProducts.length > 0 && (
        <ProductSection
          icon={<Clock className="w-5 h-5" />}
          label="Mới nhất"
          title="Sản phẩm mới"
          subtitle="Cập nhật mỗi ngày với những sản phẩm mới nhất"
          products={newProducts}
          linkHref="/shop?sort=newest"
          linkText="Xem tất cả"
          t={t}
        />
      )}

      {/* Featured Products Section */}
      {displayFeatured.length > 0 && (
        <ProductSection
          icon={<Award className="w-5 h-5" />}
          label="Nổi bật"
          title="Sản phẩm nổi bật"
          subtitle="Được đánh giá cao nhất bởi khách hàng"
          products={displayFeatured}
          linkHref="/shop"
          linkText="Khám phá thêm"
          t={t}
          bgAccent
        />
      )}

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <ProductSection
          icon={<TrendingUp className="w-5 h-5" />}
          label="Bán chạy"
          title="Sản phẩm bán chạy"
          subtitle="Được lựa chọn nhiều nhất bởi khách hàng"
          products={bestSellers}
          linkHref="/shop?sort=best_selling"
          linkText="Xem thêm"
          t={t}
        />
      )}

      {/* CTA Section */}
      <section className="page-shell py-12 md:py-20">
        <div className="relative overflow-hidden rounded-[8px] bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/10 p-7 md:p-14 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,var(--primary)/0.08,transparent_70%)]" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl md:text-4xl font-heading text-foreground tracking-tight">
              Khám phá toàn bộ cửa hàng
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg leading-relaxed">
              Hàng ngàn sản phẩm chính hãng với giá tốt nhất. Tìm kiếm thông minh bằng AI, giao hàng nhanh chóng.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary-hover transition-all hover:shadow-lg active:scale-[0.97]"
            >
              Đến cửa hàng
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Product Section Component ─── */
function ProductSection({
  icon,
  label,
  title,
  subtitle,
  products,
  linkHref,
  linkText,
  t,
  bgAccent = false,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  subtitle: string;
  products: Product[];
  linkHref: string;
  linkText: string;
  t: (key: any, params?: any) => string;
  bgAccent?: boolean;
}) {
  return (
    <section className={`w-full ${bgAccent ? 'bg-secondary/30' : ''}`}>
      <div className="page-shell py-10 md:py-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-primary">{icon}</span>
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">{label}</span>
            </div>
            <h2 className="text-xl md:text-3xl font-heading text-foreground tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground max-w-md">{subtitle}</p>
          </div>
          <Link
            href={linkHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors group shrink-0"
          >
            {linkText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {products.map((product, index) => (
            <HomeProductCard key={product.id} product={product} index={index} t={t} />
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="sm:hidden flex justify-center mt-8">
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-all"
          >
            {linkText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Product Card Component ─── */
function HomeProductCard({ product, index, t }: { product: Product; index: number; t: (key: string, params?: any) => string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);

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
        quantity: 1,
      });
      await fetchCart();
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ');
    }
  };

  return (
    <div
      className={`product-card group relative flex flex-col h-full cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="product-image-box relative block overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full z-10">
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.name}
               className={`object-contain w-full h-full p-2 sm:p-3 transition-transform duration-700 ease-out ${!isOutOfStock ? 'group-hover:scale-105' : ''}`}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <PackageX className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </Link>

        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
              <span className="px-3 py-2 bg-rose-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-lg border-2 border-white/20">
              Hết hàng
            </span>
          </div>
        )}

        {!isOutOfStock && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              <Sparkles className="w-3 h-3" /> New
            </span>
          )}
          {isHot && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-danger text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              <Flame className="w-3 h-3" /> Hot
            </span>
          )}
        </div>

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

        {/* Quick Actions */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-20 flex gap-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleQuickAddCart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-[8px] hover:bg-primary-hover active:scale-[0.97] transition-all shadow-md"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm giỏ</span>
            </button>
            <Link
              href={`/product/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 flex items-center justify-center bg-white/90 dark:bg-card/90 backdrop-blur-sm text-foreground rounded-[8px] hover:bg-white dark:hover:bg-card transition-all shadow-md"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 min-w-0">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <T>{product.category?.name || 'Khác'}</T>
        </span>
        <Link href={`/product/${product.slug}`} className="block flex-1">
          <h3 className={`text-sm font-semibold text-foreground leading-snug tracking-tight transition-colors duration-300 line-clamp-2 ${!isOutOfStock ? 'group-hover:text-primary' : ''}`}>
            <T>{product.name}</T>
          </h3>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mt-auto pt-1 min-w-0">
          <span className="text-base md:text-lg font-bold text-foreground leading-tight tracking-tight break-words">
            {product.minPrice ? `${product.minPrice.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </span>
          {(product.soldCount || 0) > 0 && (
            <span className="text-[11px] text-muted-foreground font-medium">
              Đã bán {product.soldCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
