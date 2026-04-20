'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, Star, ShoppingCart, ShieldCheck, Truck, 
  RotateCcw, Sparkles, ChevronRight, ChevronLeft, 
  Plus, Minus, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';

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
      
      // Fetch AI Similar Products
      let similar = [];
      try {
        const similarRes = await api.get(`/ai/similar/${productData.id}`);
        similar = similarRes.data.data || [];
      } catch (err) {
        console.error('Failed to fetch AI similar products, falling back to category match');
      }
      
      if (similar.length === 0) {
        // Fallback: fetch products in the same category
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

  const handleAddToCart = () => {
    if (!product) return;
    const variant = product.variants[selectedVariant] || product.variants[0];
    addToCart({
      productId: product.id,
      name: product.name,
      price: variant.price,
      quantity: quantity,
      image: product.images[0]?.url || 'https://via.placeholder.com/800',
      variant: variant.name
    });
    // Optional: show a toast notification here
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="font-black text-2xl uppercase tracking-widest animate-pulse">Đang tải...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-24 h-24 bg-accent border-4 border-foreground flex items-center justify-center shadow-[4px_4px_0px_0px_var(--foreground)]">
          <ShieldCheck className="w-12 h-12 text-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Không tìm thấy sản phẩm</h2>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.</p>
        </div>
        <Link href="/shop">
          <Button size="lg" className="px-8 mt-4">Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariant] || product.variants[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-accent p-4 border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] w-max">
        <Link href="/" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/shop" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Cửa hàng</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-primary truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Hero Section: Gallery & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square solid-card bg-background overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                src={product.images[selectedImage]?.url || 'https://via.placeholder.com/800'} 
                alt={product.name}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              />
            </AnimatePresence>
            
            {/* Gallery Navigation */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                className="w-12 h-12 bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] flex items-center justify-center hover:bg-secondary hover:translate-y-[-2px] transition-all"
               >
                 <ChevronLeft className="w-6 h-6 text-foreground" />
               </button>
               <button 
                onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                className="w-12 h-12 bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] flex items-center justify-center hover:bg-secondary hover:translate-y-[-2px] transition-all"
               >
                 <ChevronRight className="w-6 h-6 text-foreground" />
               </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-24 h-24 overflow-hidden border-2 transition-all shadow-[2px_2px_0px_0px_var(--foreground)] ${selectedImage === idx ? 'border-primary -translate-y-1' : 'border-foreground hover:bg-secondary hover:-translate-y-1'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-accent border-2 border-foreground text-foreground text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_var(--foreground)]">
                {product.category.name}
              </span>
              <div className="flex items-center space-x-1">
                <div className="flex text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating) ? 'fill-current' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <span className="ml-2 text-sm text-foreground font-bold tracking-widest">({product.totalReviews})</span>
              </div>
            </div>
            
            <h1 className="text-4xl xl:text-6xl font-black tracking-tighter uppercase text-foreground leading-none">
              {product.name}
            </h1>

            <div className="flex items-baseline space-x-4 bg-secondary p-4 border-l-8 border-primary border-y-2 border-r-2 border-y-foreground border-r-foreground">
               <span className="text-4xl xl:text-5xl font-black text-foreground">
                 {currentVariant.price.toLocaleString('vi-VN')}đ
               </span>
               <span className="text-muted-foreground font-bold tracking-widest line-through text-lg">
                 {(currentVariant.price * 1.2).toLocaleString('vi-VN')}đ
               </span>
            </div>
          </div>

          <div className="solid-card p-6 bg-background">
            <p className="text-foreground font-medium text-lg leading-relaxed line-clamp-4">
              {product.description}
            </p>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Chọn phiên bản
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {product.variants.map((variant, idx) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(idx)}
                  className={`p-4 text-left transition-all border-2 border-foreground font-bold uppercase ${selectedVariant === idx ? 'bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_var(--foreground)] translate-y-[-2px]' : 'bg-background text-foreground hover:bg-secondary hover:shadow-[2px_2px_0px_0px_var(--foreground)] hover:translate-y-[-2px]'}`}
                >
                  <p className="text-sm line-clamp-1">{variant.name}</p>
                  <p className="text-xs mt-1 opacity-80">{variant.price.toLocaleString('vi-VN')}đ</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-6 pt-6 border-t-4 border-foreground">
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors border-r-2 border-foreground"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center font-black text-xl">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors border-l-2 border-foreground"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Còn <span className="text-primary font-black text-lg">{currentVariant.stock}</span> SP
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button onClick={handleAddToCart} className="flex-1 h-16 text-lg" variant="outline">
                 <ShoppingCart className="w-6 h-6 mr-3" />
                 Thêm vào giỏ
               </Button>
               <Button onClick={handleBuyNow} className="flex-1 h-16 text-lg">
                 Mua ngay
               </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 pt-6">
             <div className="text-center space-y-3 group border-2 border-foreground p-4 hover:bg-secondary transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]">
                <ShieldCheck className="w-8 h-8 mx-auto text-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Bảo mật tuyệt đối</p>
             </div>
             <div className="text-center space-y-3 group border-2 border-foreground p-4 hover:bg-secondary transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]">
                <Truck className="w-8 h-8 mx-auto text-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Giao hàng 2H</p>
             </div>
             <div className="text-center space-y-3 group border-2 border-foreground p-4 hover:bg-secondary transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]">
                <RotateCcw className="w-8 h-8 mx-auto text-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Đổi trả 30 ngày</p>
             </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <section className="space-y-10 border-t-8 border-foreground pt-12">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center text-foreground">
              <Sparkles className="w-8 h-8 mr-3 text-primary" /> Sản phẩm liên quan
            </h2>
          </div>
          <Link href="/shop">
            <Button variant="outline" className="hidden sm:flex">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {similarProducts.map((p) => (
            <div key={p.id} className="solid-card bg-background flex flex-col group hover:-translate-y-2 transition-transform cursor-pointer relative p-0 overflow-hidden">
              <Link href={`/product/${p.slug}`} className="block relative aspect-square border-b-2 border-foreground bg-secondary">
                <img src={p.images?.[0]?.url || p.primaryImage || 'https://via.placeholder.com/200'} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-500" />
              </Link>
              <div className="p-3 space-y-2">
                <Link href={`/product/${p.slug}`}>
                  <h4 className="text-sm font-black uppercase text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">{p.name}</h4>
                </Link>
                <p className="text-lg text-foreground font-black">{(p.variants?.[0]?.price || p.minPrice || 0).toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          ))}
          {similarProducts.length === 0 && Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="solid-card bg-muted aspect-[3/4] animate-pulse flex items-center justify-center">
               <span className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Loading...</span>
             </div>
          ))}
        </div>
      </section>

      {/* Product Details Tabs (Description & Reviews) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t-8 border-foreground">
        <div className="lg:col-span-2 space-y-12">
           <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground bg-primary text-primary-foreground px-4 py-2 w-max shadow-[4px_4px_0px_0px_var(--foreground)] border-2 border-foreground">
                Mô tả chi tiết
              </h2>
              <div className="solid-card p-8 bg-background leading-relaxed text-lg font-medium">
                {product.description}
                <div className="mt-8 pt-6 border-t-4 border-dashed border-foreground text-sm font-bold uppercase tracking-widest text-muted-foreground">
                   * Lưu ý: Sản phẩm thực tế có thể thay đổi nhẹ tùy theo phiên bản và khu vực phân phối.
                </div>
              </div>
           </div>

           <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground bg-secondary px-4 py-2 w-max shadow-[4px_4px_0px_0px_var(--foreground)] border-2 border-foreground">
                Đánh giá ({product.reviews.length})
              </h2>
              <div className="space-y-6">
                {product.reviews.map((review, i) => (
                  <div key={review.id} className="solid-card p-6 bg-background flex space-x-6">
                    <div className="w-16 h-16 bg-accent border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={review.user.avatar || 'https://via.placeholder.com/64'} alt="" className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-black text-lg uppercase tracking-wider text-foreground">{review.user.name}</h4>
                        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex text-primary">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-current' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <p className="text-base font-medium text-foreground pt-2">{review.comment}</p>
                    </div>
                  </div>
                ))}
                {product.reviews.length === 0 && (
                  <div className="solid-card p-12 bg-background text-center">
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-lg">Chưa có đánh giá nào cho siêu phẩm này.</p>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="solid-card p-8 bg-accent">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 text-foreground border-b-4 border-foreground pb-4">
                Bảo hành Ultra
              </h3>
              <ul className="space-y-6 text-sm font-bold text-foreground">
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-primary border-2 border-foreground flex items-center justify-center mr-4 shadow-[2px_2px_0px_0px_var(--foreground)] flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="pt-1 leading-snug">Cam kết chính hãng 100% được xác thực bởi AI.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-background border-2 border-foreground flex items-center justify-center mr-4 shadow-[2px_2px_0px_0px_var(--foreground)] flex-shrink-0">
                    <Truck className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="pt-1 leading-snug">Giao hàng siêu tốc trong 2h tại khu vực nội thành.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-background border-2 border-foreground flex items-center justify-center mr-4 shadow-[2px_2px_0px_0px_var(--foreground)] flex-shrink-0">
                    <RotateCcw className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="pt-1 leading-snug">Đổi trả miễn phí trong 30 ngày nếu phát hiện lỗi.</span>
                </li>
              </ul>
              <Link href="/ai-hub" className="block mt-8">
                <Button className="w-full h-14 text-base">Chat với trợ lý AI</Button>
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
