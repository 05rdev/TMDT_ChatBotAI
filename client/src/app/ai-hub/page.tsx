'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Camera, Mic, Bot, Sparkles, Image as ImageIcon, Loader2, ArrowRight, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState<'visual' | 'voice' | 'chatbot'>('chatbot');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuthStore();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setIsProcessing(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/ai/visual-search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data.data);
    } catch (err) {
      console.error('Visual Search failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in-up px-4 sm:px-6">
      <section className="text-center space-y-6 pt-10">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-primary/5">
          <Bot className="text-primary w-10 h-10" />
        </div>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl sm:text-5xl text-foreground">AI Hub</h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Trung tâm điều khiển trải nghiệm mua sắm thông minh. Sử dụng hình ảnh và giọng nói để tìm thấy chính xác những gì bạn mong muốn.
          </p>
        </div>
      </section>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {[
          { id: 'chatbot', name: 'Trợ lý ảo', icon: MessageSquare },
          { id: 'visual', name: 'Tìm bằng ảnh', icon: Camera },
          { id: 'voice', name: 'Ra lệnh giọng nói', icon: Mic },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setResults(null); setPreviewUrl(null); }}
            className={`flex items-center space-x-2.5 px-6 py-3 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4.5 h-4.5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="card-elevated bg-card rounded-[var(--radius-xl)] p-8 sm:p-12 min-h-[450px] flex flex-col items-center justify-center relative overflow-hidden border border-border">
        
        {/* Soft Background Decorators */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        {activeTab === 'visual' && (
          <div className="w-full space-y-10 relative z-10 animate-fade-in-up">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-3xl text-foreground">Bạn thích phong cách này?</h2>
              <p className="text-muted-foreground text-sm">Tải ảnh lên để hệ thống tìm sản phẩm tương tự cho bạn.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-2 border-dashed border-border bg-secondary/30 rounded-[var(--radius-xl)] aspect-video sm:aspect-[21/9] flex flex-col items-center justify-center space-y-4 hover:bg-secondary/60 hover:border-primary/50 transition-all relative overflow-hidden"
            >
              {previewUrl ? (
                <div className="absolute inset-0 p-4">
                  <div className="w-full h-full rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-card rounded-full shadow-sm border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="text-muted-foreground w-8 h-8 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-foreground font-medium text-sm">Nhấn để chọn hoặc kéo thả ảnh</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {isProcessing && (
              <div className="flex flex-col items-center space-y-4 py-8 bg-primary/5 border border-primary/20 rounded-[var(--radius-lg)] p-6">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-primary font-medium text-sm animate-pulse text-center">Đang phân tích hình ảnh và tìm kiếm sản phẩm phù hợp...</p>
              </div>
            )}

            {results && <VisualSearchResults data={results} />}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="w-full text-center space-y-10 relative z-10 animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="font-heading text-3xl text-foreground">Nói cho chúng tôi biết yêu cầu</h2>
              <p className="text-muted-foreground text-sm">Nhấn nút bên dưới và ra lệnh bằng giọng nói.</p>
            </div>

            <div className="flex flex-col items-center space-y-12 pt-8">
               <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <button className="relative w-28 h-28 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group">
                    <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  </button>
               </div>
               
               <div className="space-y-6 max-w-md bg-secondary/50 p-6 rounded-[var(--radius-xl)] border border-border">
                 <p className="text-foreground font-medium italic">"Tìm cho tôi một đôi giày chạy bộ thoải mái, giá dưới 2 triệu"</p>
                 <div className="flex items-center justify-center space-x-1.5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="w-1.5 h-6 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                 </div>
               </div>
               
               {!isAuthenticated && (
                 <div className="bg-warning/10 text-warning border border-warning/20 px-4 py-3 rounded-[var(--radius-lg)] font-medium text-sm">
                   Vui lòng đăng nhập để hệ thống ghi nhớ sở thích của bạn!
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="w-full text-center space-y-8 relative z-10 animate-fade-in-up">
             <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-accent/5">
               <Sparkles className="text-accent w-10 h-10" />
             </div>
             <div className="space-y-4">
               <h2 className="font-heading text-3xl sm:text-4xl text-foreground">Trợ lý mua sắm AI</h2>
               <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">Xin chào! Tôi có thể giúp gì cho bạn hôm nay? Tôi biết tất cả về kho hàng và các chương trình khuyến mãi hiện có.</p>
             </div>
             <Link href="/chatbot" className="inline-block pt-4">
                <Button size="lg" className="px-8 rounded-full shadow-md hover:shadow-lg group">
                   Bắt đầu trò chuyện 
                   <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function VisualSearchResults({ data }: { data: any }) {
  return (
    <div className="space-y-8 pt-10 border-t border-border animate-fade-in-up">
       <div className="flex items-center space-x-3 bg-secondary/50 p-4 rounded-[var(--radius-lg)] border border-border">
          <Bot className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm font-medium text-foreground">Phân tích kết quả: <span className="text-primary">"{data.description}"</span></p>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {data.products?.map((p: any) => (
             <div key={p.id} className="card-elevated bg-card flex flex-col group p-0 overflow-hidden border border-border rounded-[var(--radius-lg)]">
                <Link href={`/product/${p.slug}`} className="block relative aspect-square bg-secondary/30 overflow-hidden">
                   {p.primaryImage ? (
                     <img src={p.primaryImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={p.name} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Không có ảnh</div>
                   )}
                </Link>
                <div className="p-4 space-y-1.5">
                  <Link href={`/product/${p.slug}`}>
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h4>
                  </Link>
                  <p className="text-base text-foreground font-bold">{(p.variants?.[0]?.price || p.minPrice || 0).toLocaleString('vi-VN')}đ</p>
                </div>
             </div>
          ))}
       </div>
       <div className="flex justify-center pt-4">
         <Link href="/shop">
           <Button variant="outline" className="px-6 rounded-full">
             Khám phá thêm sản phẩm <Plus className="ml-2 w-4 h-4" />
           </Button>
         </Link>
       </div>
    </div>
  );
}
