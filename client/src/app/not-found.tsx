'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, Compass, MapPinOff } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Background Decorative Blur */}
        <div className="absolute inset-0 bg-emerald-500/10 rounded-[3rem] blur-3xl -z-10" />
        
        <div className="glass-card p-12 rounded-[2rem] text-center space-y-8 border-t border-l border-white/20 shadow-2xl">
          <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping" />
            <MapPinOff className="w-12 h-12 text-red-500 relative z-10" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-6xl font-black gradient-text">404</h1>
            <h2 className="text-2xl font-bold text-foreground">Lạc đường rồi!</h2>
            <p className="text-muted-foreground text-sm">
              Con đường bạn đang tìm kiếm dường như không tồn tại hoặc đã được di chuyển sang một vũ trụ khác.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/" className="flex-1">
              <Button className="w-full flex justify-center items-center h-12 rounded-xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <Home className="w-4 h-4 mr-2" /> Về nhà
                </span>
                <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
            </Link>
            
            <Link href="/shop" className="flex-1">
              <Button variant="secondary" className="w-full flex justify-center items-center h-12 rounded-xl border border-border">
                <Compass className="w-4 h-4 mr-2" /> Khám phá
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
