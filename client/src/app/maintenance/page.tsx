'use client';

import React from 'react';
import { Wrench, Phone, Mail, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MaintenancePage() {
  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-foreground flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Main glassmorphism container */}
      <div className="w-full max-w-lg card-elevated p-8 sm:p-12 rounded-[2rem] text-center space-y-8 bg-card/40 border border-white/5 backdrop-blur-md relative z-10 animate-fade-in-up">
        {/* Animated icon */}
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border border-primary/20 relative group">
          <Wrench className="w-9 h-9 text-primary animate-bounce-slow" />
          <div className="absolute inset-0 bg-primary/20 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80 bg-primary/5 px-3.5 py-1.5 rounded-full border border-primary/15">
            BẢO TRÌ HỆ THỐNG
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground font-bold tracking-tight pt-2">
            UltraShop đang nâng cấp
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt nhất cho bạn. Hệ thống sẽ sớm hoạt động trở lại.
          </p>
        </div>

        {/* Retry Button */}
        <div className="pt-2">
          <Button 
            onClick={handleRetry} 
            className="w-full sm:w-auto px-8 py-3 rounded-full flex justify-center items-center gap-2 mx-auto"
          >
            <RotateCw className="w-4 h-4" /> Thử lại
          </Button>
        </div>

        {/* Support Info */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary/70" />
            <span>Hotline: 0123 456 789</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary/70" />
            <span>Email: contact@ultrashop.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
