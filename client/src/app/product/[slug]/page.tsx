'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Loader2, Star, ShoppingCart, ShieldCheck, Truck, 
  RotateCcw, Sparkles, ChevronRight, ChevronLeft, 
  Plus, Minus, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  averageRating: number;
  totalReviews: number;
  category: { name: string };
  images: { url: string; isPrimary: boolean }[];
  variants: { id: string; name: string; price: number; stock: number; attributes: any }[];
  reviews: any[];
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

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
      const similarRes = await api.get(`/ai/similar/${productData.id}`);
      setSimilarProducts(similarRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch product', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-slate-500 animate-pulse text-lg">Đang tải tuyệt tác...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Không tìm thấy sản phẩm</h2>
          <p className="text-slate-400">Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.</p>
        </div>
        <Link href="/shop">
          <Button variant="outline">Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariant] || product.variants[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-500 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/shop" className="hover:text-emerald-500 transition-colors">Cửa hàng</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-emerald-500 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Hero Section: Gallery & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-3xl overflow-hidden glass-card border-white/10 group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                src={product.images[selectedImage]?.url || 'https://via.placeholder.com/800'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Gallery Navigation */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-emerald-500 transition-colors"
               >
                 <ChevronLeft className="w-6 h-6" />
               </button>
               <button 
                onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-emerald-500 transition-colors"
               >
                 <ChevronRight className="w-6 h-6" />
               </button>
            </div>

            {/* AI Badge */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-emerald-500/80 backdrop-blur-xl rounded-full flex items-center shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Lựa chọn bởi AI</span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden glass-card border-2 transition-all ${selectedImage === idx ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-white/5 hover:border-white/20'}`}
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
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                {product.category.name}
              </span>
              <div className="flex items-center space-x-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating) ? 'fill-current' : 'text-slate-700'}`} />
                ))}
                <span className="ml-2 text-sm text-slate-400 font-medium">({product.totalReviews} đánh giá)</span>
              </div>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline space-x-3">
               <span className="text-3xl xl:text-4xl font-black text-emerald-400 italic">
                 {currentVariant.price.toLocaleString('vi-VN')}đ
               </span>
               <span className="text-slate-500 line-through text-sm">
                 {(currentVariant.price * 1.2).toLocaleString('vi-VN')}đ
               </span>
            </div>
          </div>

          <p className="text-slate-400 text-lg leading-relaxed line-clamp-3">
            {product.description}
          </p>

          <div className="w-full h-[1px] bg-white/5" />

          {/* Variants */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center">
              <Plus className="w-4 h-4 mr-2 text-emerald-500" /> Chọn phiên bản
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.variants.map((variant, idx) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(idx)}
                  className={`p-4 rounded-2xl glass-card text-left transition-all border-2 ${selectedVariant === idx ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 hover:border-white/20'}`}
                >
                  <p className={`text-sm font-bold ${selectedVariant === idx ? 'text-emerald-400' : 'text-slate-200'}`}>{variant.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{variant.price.toLocaleString('vi-VN')}đ</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:text-emerald-500 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:text-emerald-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-500">
                <span className="text-emerald-500 font-bold">{currentVariant.stock}</span> sản phẩm còn lại
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button className="flex-1 h-14 rounded-2xl text-lg font-bold group">
                 <ShoppingCart className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                 Thêm vào giỏ hàng
               </Button>
               <Button variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-bold border-white/10 hover:bg-white/5">
                 Mua ngay
               </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 pt-4">
             <div className="text-center space-y-2 group">
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Bảo mật</p>
             </div>
             <div className="text-center space-y-2 group">
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all">
                  <Truck className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Giao nhanh</p>
             </div>
             <div className="text-center space-y-2 group">
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Đổi trả</p>
             </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-emerald-500" /> Có thể bạn cũng thích
            </h2>
            <p className="text-slate-400">Dựa trên sở thích và đặc điểm của sản phẩm này, AI gợi ý cho bạn:</p>
          </div>
          <Link href="/shop">
            <Button variant="ghost" className="text-slate-400 group">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {similarProducts.map((p) => (
            <motion.div 
              key={p.id}
              whileHover={{ y: -8 }}
              className="glass-card rounded-2xl overflow-hidden border-white/5 p-3 group"
            >
              <Link href={`/product/${p.slug}`} className="block relative aspect-square rounded-xl overflow-hidden bg-slate-800">
                <img src={p.images?.[0]?.url || 'https://via.placeholder.com/200'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </Link>
              <div className="pt-3 space-y-1">
                <Link href={`/product/${p.slug}`}>
                  <h4 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-emerald-400 transition-colors">{p.name}</h4>
                </Link>
                <p className="text-xs text-emerald-500 font-bold">{p.variants?.[0]?.price.toLocaleString('vi-VN')}đ</p>
              </div>
            </motion.div>
          ))}
          {similarProducts.length === 0 && Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="glass-card rounded-2xl aspect-square border-white/5 animate-pulse flex items-center justify-center text-slate-700">
               <Sparkles className="w-8 h-8 opacity-20" />
             </div>
          ))}
        </div>
      </section>

      {/* Product Details Tabs (Description & Reviews) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <div className="space-y-4">
              <h2 className="text-2xl font-bold border-l-4 border-emerald-500 pl-4">Mô tả sản phẩm</h2>
              <div className="glass-card p-8 rounded-3xl border-white/5 text-slate-400 leading-relaxed text-lg italic bg-white/5">
                "{product.description}"
                <div className="mt-6 not-italic text-sm text-slate-500">
                   * Lưu ý: Sản phẩm thực tế có thể thay đổi nhẹ tùy theo phiên bản và khu vực phân phối.
                </div>
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-emerald-500 pl-4">Đánh giá thực tế</h2>
              <div className="space-y-4">
                {product.reviews.map((review, i) => (
                  <div key={review.id} className="glass-card p-6 rounded-2xl border-white/5 flex space-x-4">
                    <img src={review.user.avatar || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 rounded-full border border-emerald-500/20" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-200">{review.user.name}</h4>
                        <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'fill-current' : 'text-slate-800'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-slate-400 mt-2">{review.comment}</p>
                    </div>
                  </div>
                ))}
                {product.reviews.length === 0 && (
                  <p className="text-slate-500 italic p-10 text-center glass-card rounded-2xl">Chưa có đánh giá nào cho tác phẩm này. Hãy là người đầu tiên trải nghiệm!</p>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="glass-card p-8 rounded-3xl border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all" />
              <h3 className="text-xl font-bold mb-4">UltraShop AI Guarantee</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start">
                  <ShieldCheck className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0" />
                  <span>Cam kết chính hãng 100% được xác thực bởi AI.</span>
                </li>
                <li className="flex items-start">
                   <Truck className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0" />
                   <span>Giao hàng siêu tốc trong 2h tại khu vực nội thành.</span>
                </li>
                <li className="flex items-start">
                   <RotateCcw className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0" />
                   <span>Đổi trả miễn phí trong 30 ngày nếu phát hiện lỗi.</span>
                </li>
              </ul>
              <Button className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">Chat với AI Assistant</Button>
           </div>
        </div>
      </section>
    </div>
  );
}
