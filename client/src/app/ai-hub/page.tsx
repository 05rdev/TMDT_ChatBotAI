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
    <div className="max-w-4xl mx-auto space-y-16 pb-20">
      <section className="text-center space-y-6">
        <div className="w-24 h-24 bg-primary border-4 border-foreground flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_var(--foreground)]">
          <Bot className="text-primary-foreground w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground">AI Hub</h1>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs max-w-lg mx-auto leading-relaxed">
            Trung tâm điều khiển trải nghiệm mua sắm thông minh. Sử dụng hình ảnh và giọng nói để tìm thấy chính xác những gì bạn đang tìm kiếm.
          </p>
        </div>
      </section>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {[
          { id: 'chatbot', name: 'Assistant', icon: MessageSquare },
          { id: 'visual', name: 'Visual Search', icon: Camera },
          { id: 'voice', name: 'Voice Assistant', icon: Mic },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setResults(null); setPreviewUrl(null); }}
            className={`flex items-center space-x-3 px-8 py-4 border-4 font-black uppercase tracking-widest text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-primary-foreground border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] -translate-y-1 translate-x-1' 
                : 'bg-background text-foreground border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:translate-x-1'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="solid-card bg-background p-10 min-h-[500px] flex flex-col items-center justify-center relative border-4 shadow-[12px_12px_0px_0px_var(--foreground)]">
        
        {activeTab === 'visual' && (
          <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Bạn thích món đồ này?</h2>
              <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Tải ảnh lên để em tìm sản phẩm tương tự cho anh/chị nhé.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-4 border-dashed border-foreground bg-accent aspect-video flex flex-col items-center justify-center space-y-4 hover:bg-secondary transition-all relative overflow-hidden shadow-[4px_4px_0px_0px_var(--foreground)]"
            >
              {previewUrl ? (
                <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 bg-background border-4 border-foreground flex items-center justify-center group-hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_var(--foreground)]">
                    <ImageIcon className="text-foreground w-10 h-10" />
                  </div>
                  <p className="text-foreground font-black uppercase tracking-widest text-sm">Nhấn để chọn hoặc kéo thả ảnh</p>
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
              <div className="flex flex-col items-center space-y-4 py-8 bg-primary/10 border-2 border-dashed border-primary p-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-primary font-black uppercase tracking-widest text-xs animate-pulse text-center">Em đang nhìn kỹ ảnh một chút, chờ em xíu nha...</p>
              </div>
            )}

            {results && <VisualSearchResults data={results} />}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Nói cho em biết yêu cầu</h2>
              <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Hãy nhấn nút bên dưới và ra lệnh bằng giọng nói.</p>
            </div>

            <div className="flex flex-col items-center space-y-12 pt-8">
               <div className="relative">
                  <button className="relative w-32 h-32 bg-primary border-4 border-foreground flex items-center justify-center shadow-[8px_8px_0px_0px_var(--foreground)] hover:scale-105 active:translate-y-1 active:shadow-[4px_4px_0px_0px_var(--foreground)] transition-all cursor-pointer group">
                    <Mic className="text-primary-foreground w-12 h-12 group-hover:scale-110 transition-transform" />
                  </button>
               </div>
               
               <div className="space-y-6 max-w-md bg-secondary p-6 border-4 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)]">
                 <p className="text-foreground font-black uppercase tracking-tight italic">"Tìm cho tôi một đôi giày chạy bộ tầm dưới 2 triệu"</p>
                 <div className="flex items-center justify-center space-x-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="w-2 h-8 bg-primary border-2 border-foreground animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                 </div>
               </div>
               
               {!isAuthenticated && (
                 <div className="bg-primary text-primary-foreground border-4 border-foreground p-4 font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_var(--foreground)]">
                   Dạ, anh/chị hãy đăng nhập để em có thể nhớ được các yêu cầu vừa rồi nhé!
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="w-24 h-24 bg-accent border-4 border-foreground flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_var(--foreground)]">
               <Sparkles className="text-foreground w-12 h-12" />
             </div>
             <div className="space-y-4">
               <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Trợ lý mua sắm RAG</h2>
               <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs max-w-md mx-auto leading-relaxed">Chào anh/chị! Em có thể giúp gì cho anh/chị hôm nay ạ? Em biết tất cả về kho hàng và các chương trình khuyến mãi hiện có.</p>
             </div>
             <Link href="/chatbot" className="inline-block">
                <Button size="lg" className="px-12 h-16 text-lg font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:translate-x-1 transition-all">
                   Bắt đầu hội thoại <ArrowRight className="ml-3 w-6 h-6" />
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
    <div className="space-y-8 py-10 border-t-4 border-foreground animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 bg-accent p-3 border-2 border-foreground">
             <Bot className="w-6 h-6 text-foreground" />
             <p className="text-xs font-black uppercase tracking-widest text-foreground">Phân tích của em: <span className="text-primary italic font-black">"{data.description}"</span></p>
          </div>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {data.products?.map((p: any) => (
             <div key={p.id} className="solid-card bg-background flex flex-col group hover:-translate-y-2 transition-all p-0 overflow-hidden border-2 shadow-[4px_4px_0px_0px_var(--foreground)]">
                <Link href={`/product/${p.slug}`} className="block relative aspect-square border-b-2 border-foreground bg-secondary">
                   {p.primaryImage ? (
                     <img src={p.primaryImage} className="w-full h-full object-cover transition-all duration-500" alt={p.name} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-foreground font-black uppercase tracking-widest text-[10px]">No Image</div>
                   )}
                </Link>
                <div className="p-4 space-y-2">
                  <Link href={`/product/${p.slug}`}>
                    <h4 className="text-xs font-black uppercase text-foreground line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{p.name}</h4>
                  </Link>
                  <p className="text-lg text-foreground font-black">{(p.variants?.[0]?.price || p.minPrice || 0).toLocaleString('vi-VN')}đ</p>
                </div>
             </div>
          ))}
       </div>
       <div className="flex justify-center">
         <Link href="/shop">
           <Button variant="outline" className="px-8 border-2 shadow-[4px_4px_0px_0px_var(--foreground)]">
             Xem thêm trong cửa hàng <Plus className="ml-2 w-4 h-4" />
           </Button>
         </Link>
       </div>
    </div>
  );
}
