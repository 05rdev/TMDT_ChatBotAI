'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
}

export const BannerCarousel = ({ height = "h-[400px] md:h-[500px] lg:h-[600px]" }: { height?: string }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fallbackBanners: Banner[] = [
    {
      id: 'fallback-1',
      title: 'Trợ lý mua sắm AI thế hệ mới',
      subtitle: 'Tìm kiếm sản phẩm bằng hình ảnh, giọng nói và nhận đề xuất thông minh cá nhân hóa.',
      imageUrl: 'fallback-gradient-1',
      link: '/ai-hub'
    },
    {
      id: 'fallback-2',
      title: 'Cửa hàng công nghệ UltraShop',
      subtitle: 'Khám phá hàng ngàn thiết bị công nghệ hiện đại nhất với ưu đãi tốt nhất.',
      imageUrl: 'fallback-gradient-2',
      link: '/shop'
    }
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners?active=true');
        if (res.data.success) {
          setBanners(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch banners', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const displayBanners = banners.length > 0 ? banners : (loading ? [] : fallbackBanners);

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayBanners]);

  if (displayBanners.length === 0) return null;

  const next = () => setCurrentIndex(prev => (prev + 1) % displayBanners.length);
  const prev = () => setCurrentIndex(prev => (prev - 1 + displayBanners.length) % displayBanners.length);

  return (
    <div className={`relative w-full ${height} overflow-hidden bg-secondary group`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={displayBanners[currentIndex].id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Banner Image / Gradient Fallback */}
          {displayBanners[currentIndex].imageUrl.startsWith('fallback-gradient-') ? (
            <div className={`w-full h-full relative overflow-hidden ${
              displayBanners[currentIndex].imageUrl === 'fallback-gradient-1'
                ? 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900'
                : 'bg-gradient-to-tr from-teal-950 via-cyan-950 to-slate-900'
            }`}>
              {/* Decorative nodes/grid */}
              <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
            </div>
          ) : (
            <img 
              src={displayBanners[currentIndex].imageUrl} 
              alt={displayBanners[currentIndex].title}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 text-white">
            <div className="max-w-2xl space-y-3 sm:space-y-4 md:space-y-6">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading leading-tight font-black"
              >
                {displayBanners[currentIndex].title}
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 max-w-lg leading-relaxed font-medium"
              >
                {displayBanners[currentIndex].subtitle}
              </motion.p>
              {displayBanners[currentIndex].link && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-3 sm:pt-4"
                >
                  <Link 
                    href={displayBanners[currentIndex].link!}
                    className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 shadow-xl text-sm sm:text-base"
                  >
                    Khám phá ngay
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {displayBanners.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={next}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3">
            {displayBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 sm:h-3 rounded-full transition-all cursor-pointer ${currentIndex === i ? 'bg-primary w-6 sm:w-8' : 'bg-white/50 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
