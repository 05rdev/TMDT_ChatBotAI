'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, Star, ShoppingCart, ShieldCheck, Truck, 
  RotateCcw, Sparkles, ChevronRight, ChevronLeft, 
  Plus, Minus, ArrowRight, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { T } from '@/components/T';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  averageRating: number;
  totalReviews: number;
  category: { id: string; name: string };
  images: { url: string; isPrimary: boolean }[];
  variants: { id: string; name: string; price: number; stock: number; attributes: any }[];
  reviews: any[];
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  
  const addToCart = useCartStore((state) => state.addItem);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const { user } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/slug/${slug}`);
      const productData = response.data.data;
      setProduct(productData);
      
      let similar = [];
      try {
        const similarRes = await api.get(`/ai/similar/${productData.id}`);
        similar = similarRes.data.data || [];
      } catch (err) {
        console.error('Failed to fetch AI similar products');
      }
      
      if (similar.length === 0) {
        try {
          const fallbackRes = await api.get(`/products?categoryId=${productData.category.id}`);
          similar = (fallbackRes.data.data || []).filter((p: any) => p.id !== productData.id).slice(0, 6);
        } catch (e) {
          console.error('Fallback similar products also failed');
        }
      }
      setSimilarProducts(similar);
    } catch (err) {
      console.error('Failed to fetch product', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login');
      return;
    }

    const variant = product.variants[selectedVariant] || product.variants[0];
    
    try {
      await api.post('/cart', {
        productId: product.id,
        productVariantId: variant.id,
        quantity: quantity
      });
      await fetchCart();
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error('Lỗi khi thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="card-elevated p-12 rounded-[var(--radius-xl)] max-w-lg text-center space-y-6">
          <div className="w-20 h-20 bg-secondary rounded-[var(--radius-lg)] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-3xl text-foreground">{t('notFound.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('notFound.desc')}</p>
          </div>
          <Link href="/shop" className="inline-block pt-4">
            <Button size="lg" className="px-8">{t('notFound.goHome')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariant] || product.variants[0];

  return (
    <div className="space-y-16 pb-20 animate-fade-in-up">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">{t('product.home')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-foreground transition-colors">{t('product.shop')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primary truncate max-w-[200px]"><T>{product.name}</T></span>
      </nav>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square card-elevated rounded-[var(--radius-xl)] bg-secondary overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage]?.url || ''} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Gallery Nav */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                className="w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:bg-background text-foreground transition-all"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <button 
                onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                className="w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:bg-background text-foreground transition-all"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-[var(--radius-md)] overflow-hidden transition-all ${selectedImage === idx ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-secondary text-foreground text-xs font-medium rounded-full">
                <T>{product.category.name}</T>
              </span>
              <div className="flex items-center space-x-1.5">
                <div className="flex text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating) ? 'fill-current' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium">{t('product.reviews', { count: product.totalReviews })}</span>
              </div>
            </div>
            
            <h1 className="font-heading text-4xl xl:text-5xl text-foreground leading-[1.1] tracking-tight">
              <T>{product.name}</T>
            </h1>

            <div className="flex items-baseline space-x-4 pt-2">
               <span className="text-3xl xl:text-4xl font-bold text-foreground">
                 {currentVariant.price.toLocaleString('vi-VN')}đ
               </span>
               <span className="text-muted-foreground font-medium line-through text-lg">
                 {(currentVariant.price * 1.2).toLocaleString('vi-VN')}đ
               </span>
            </div>
          </div>

          <p className="text-muted-foreground text-base leading-relaxed line-clamp-3">
            <T>{product.description}</T>
          </p>

          {/* Variants */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center">
              {t('product.selectVersion')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.variants.map((variant, idx) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(idx)}
                  className={`p-3 text-left rounded-[var(--radius-md)] border transition-all ${selectedVariant === idx ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-foreground/30'}`}
                >
                  <p className={`text-sm font-semibold line-clamp-1 ${selectedVariant === idx ? 'text-primary' : 'text-foreground'}`}><T>{variant.name}</T></p>
                  <p className="text-xs mt-1 text-muted-foreground">{variant.price.toLocaleString('vi-VN')}đ</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-6 pt-6 border-t border-border">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-muted-foreground">{t('product.quantity')}:</span>
              <div className="flex items-center bg-secondary rounded-[var(--radius-md)] p-1">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center bg-card rounded-[var(--radius-sm)] shadow-sm hover:text-primary transition-colors text-foreground"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-base">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 flex items-center justify-center bg-card rounded-[var(--radius-sm)] shadow-sm hover:text-primary transition-colors text-foreground"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('product.stockAvailable', { count: currentVariant.stock })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button onClick={handleAddToCart} size="lg" className="flex-1" variant="outline">
                 <ShoppingCart className="w-5 h-5 mr-2" />
                 {t('product.addToCart')}
               </Button>
               <Button onClick={handleBuyNow} size="lg" className="flex-1">
                 {t('product.buyNow')}
               </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 pt-4">
             <div className="text-center space-y-2.5 p-4 bg-secondary/50 rounded-[var(--radius-lg)]">
                <ShieldCheck className="w-6 h-6 mx-auto text-primary" />
                <p className="text-xs font-medium text-foreground">{t('product.protection')}</p>
             </div>
             <div className="text-center space-y-2.5 p-4 bg-secondary/50 rounded-[var(--radius-lg)]">
                <Truck className="w-6 h-6 mx-auto text-primary" />
                <p className="text-xs font-medium text-foreground">{t('product.delivery2h')}</p>
             </div>
             <div className="text-center space-y-2.5 p-4 bg-secondary/50 rounded-[var(--radius-lg)]">
                <RotateCcw className="w-6 h-6 mx-auto text-primary" />
                <p className="text-xs font-medium text-foreground">{t('product.return30d')}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <section className="space-y-8 pt-10 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-3xl text-foreground flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-primary" /> {t('product.suggested')}
          </h2>
          <Link href="/shop">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              {t('product.viewMore')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {similarProducts.map((p) => (
            <div key={p.id} className="card-elevated-hover bg-card flex flex-col group cursor-pointer overflow-hidden">
              <Link href={`/product/${p.slug}`} className="block relative aspect-square bg-secondary">
                {p.images?.[0]?.url || p.primaryImage ? (
                  <img src={p.images?.[0]?.url || p.primaryImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Bot className="w-8 h-8 text-muted opacity-30"/></div>
                )}
              </Link>
              <div className="p-3.5 space-y-1.5">
                <Link href={`/product/${p.slug}`}>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">{p.name}</h4>
                </Link>
                <p className="text-base text-foreground font-bold">{(p.variants?.[0]?.price || p.minPrice || 0).toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs / Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 border-t border-border">
        <div className="lg:col-span-2 space-y-10">
           {/* Description */}
           <div className="space-y-5">
              <h3 className="font-semibold text-xl text-foreground">{t('product.detailDescription')}</h3>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p><T>{product.description}</T></p>
                <div className="mt-6 p-4 bg-secondary/50 rounded-[var(--radius-md)] text-sm italic">
                   {t('product.disclaimer')}
                </div>
              </div>
           </div>

           {/* Reviews */}
           <div className="space-y-6 pt-6 border-t border-border">
              <h3 className="font-semibold text-xl text-foreground">{t('product.customerReviews', { count: product.reviews.length })}</h3>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="p-5 bg-card border border-border rounded-[var(--radius-lg)] flex space-x-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {review.user.avatar ? (
                        <img src={review.user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-semibold text-muted-foreground">{review.user.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-semibold text-foreground">{review.user.name}</h4>
                        <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex text-warning">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-foreground pt-1">{review.comment}</p>
                    </div>
                  </div>
                ))}
                {product.reviews.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground text-sm">{t('product.noReviews')}</p>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="card-elevated p-6 rounded-[var(--radius-xl)] bg-card border border-border">
              <h3 className="font-semibold text-lg mb-5 text-foreground">
                {t('product.storePolicy')}
              </h3>
              <ul className="space-y-5 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <span className="leading-snug text-foreground">{t('product.policyAuthentic')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-primary shrink-0" />
                  <span className="leading-snug text-foreground">{t('product.policyDelivery')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-primary shrink-0" />
                  <span className="leading-snug text-foreground">{t('product.policyReturn')}</span>
                </li>
              </ul>
              <Link href="/ai-hub" className="block mt-6">
                <Button variant="outline" className="w-full gap-2">
                  <Bot className="w-4.5 h-4.5" /> {t('product.askAIAssistant')}
                </Button>
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
