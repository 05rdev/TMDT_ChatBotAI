'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Camera, Mic, Bot, Sparkles, Image as ImageIcon, Loader2, Search, ArrowRight, MessageSquare } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <section className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <Bot className="text-white w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">AI Hub</h1>
        <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
          Trung tâm điều khiển trải nghiệm mua sắm thông minh. Sử dụng hình ảnh và giọng nói để tìm thấy chính xác những gì bạn đang tìm kiếm.
        </p>
      </section>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center p-1 bg-white/5 rounded-2xl w-fit mx-auto border border-white/5">
        <button 
          onClick={() => { setActiveTab('chatbot'); setResults(null); setPreviewUrl(null); }}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'chatbot' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Assistant</span>
        </button>
        <button 
          onClick={() => { setActiveTab('visual'); setResults(null); setPreviewUrl(null); }}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'visual' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-sm font-medium">Visual Search</span>
        </button>
        <button 
          onClick={() => { setActiveTab('voice'); setResults(null); setPreviewUrl(null); }}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'voice' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Mic className="w-4 h-4" />
          <span className="text-sm font-medium">Voice Assistant</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Sparkles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />
        
        {activeTab === 'visual' && (
          <div className="w-full space-y-8 animate-fade-in-up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold italic gradient-text">Bạn thích món đồ này?</h2>
              <p className="text-slate-500">Tải ảnh lên để em tìm sản phẩm tương tự cho anh/chị nhé.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-2 border-dashed border-white/10 rounded-[2rem] aspect-video flex flex-col items-center justify-center space-y-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all relative overflow-hidden"
            >
              {previewUrl ? (
                <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" alt="Preview" />
              ) : null}
              
              <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="text-emerald-500 w-10 h-10" />
                </div>
                <p className="text-slate-400 font-medium">Nhấn để chọn hoặc kéo thả ảnh vào đây</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {isProcessing && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-emerald-400 animate-pulse font-medium">Em đang nhìn kỹ ảnh một chút, chờ em xíu nha...</p>
              </div>
            )}

            {results && <VisualSearchResults data={results} />}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="w-full text-center space-y-8 animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold italic gradient-text">Nói cho em biết yêu cầu của bạn</h2>
              <p className="text-slate-500">Hãy nhấn nút bên dưới và ra lệnh bằng giọng nói.</p>
            </div>

            <div className="flex flex-col items-center space-y-12 pt-8">
               <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                  <button className="relative w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer">
                    <Mic className="text-white w-12 h-12" />
                  </button>
               </div>
               
               <div className="space-y-6 max-w-md">
                 <p className="text-slate-300 font-medium italic">"Tìm cho tôi một đôi giày chạy bộ tầm dưới 2 triệu"</p>
                 <div className="flex items-center justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-1 h-4 bg-emerald-500/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                 </div>
               </div>
               
               {!isAuthenticated && (
                 <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
                   Dạ, anh/chị hãy đăng nhập để em có thể nhớ được các yêu cầu vừa rồi nhé!
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="w-full text-center space-y-6">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
               <Sparkles className="text-emerald-500 w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold">Trợ lý mua sắm RAG</h2>
             <p className="text-slate-400 max-w-md mx-auto">Chào anh/chị! Em có thể giúp gì cho anh/chị hôm nay ạ? Em biết tất cả về kho hàng và các chương trình khuyến mãi hiện có.</p>
             <Link href="/chatbot">
                <Button size="lg" className="px-12">
                   Bắt đầu hội thoại <ArrowRight className="ml-2 w-4 h-4" />
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
    <div className="space-y-6 py-8 border-t border-white/5 animate-fade-in-up">
       <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <Bot className="w-5 h-5 text-emerald-500" />
             <p className="text-sm font-medium text-slate-300">Phân tích của em: <span className="text-emerald-400 italic font-normal">"{data.description}"</span></p>
          </div>
          <Link href="/shop" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors flex items-center">
             Xem tất cả <ArrowRight className="ml-1 w-3 h-3" />
          </Link>
       </div>

       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {data.products?.map((p: any) => (
             <Link key={p.id} href={`/product/${p.slug}`} className="glass-card p-3 rounded-xl border-white/5 hover:border-emerald-500/50 transition-all group">
                <div className="aspect-square bg-slate-800 rounded-lg mb-3 overflow-hidden">
                   {p.primaryImage ? (
                     <img src={p.primaryImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-700">📦</div>
                   )}
                </div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-emerald-400 transition-colors">{p.name}</h4>
                <p className="text-xs text-emerald-500 font-bold mt-1">{p.minPrice?.toLocaleString('vi-VN')}đ</p>
             </Link>
          ))}
       </div>
    </div>
  );
}
