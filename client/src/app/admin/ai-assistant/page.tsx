'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, ShieldCheck, Sparkles, LayoutDashboard, Loader2, BarChart3, Package, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AdminAIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Chào sếp! Em là Ultra Admin Assistant. Em đã sẵn sàng báo cáo số liệu và hỗ trợ sếp quản lý hệ thống. Sếp cần kiểm tra gì hôm nay ạ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post('/ai/admin/chatbot', { message: userMessage });
      const reply = response.data.data.message;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: reply
      }]);
    } catch (err) {
      console.error('Admin chat failed', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Có lỗi xảy ra khi truy xuất dữ liệu hệ thống. Sếp vui lòng kiểm tra lại kết nối server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between border-b-4 border-foreground pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary border-4 border-foreground flex items-center justify-center shadow-[4px_4px_0px_0px_var(--foreground)]">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground flex items-center">
              Admin AI Command <Sparkles className="ml-2 w-6 h-6 text-primary" />
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hệ thống phân tích & Quản trị thông minh</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Status</span>
                <span className="text-xs font-bold text-emerald-500 uppercase flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                    Bão hòa dữ liệu
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
        
        {/* Left Sidebar - Quick Actions */}
        <div className="hidden lg:flex flex-col space-y-4">
            <div className="solid-card bg-accent p-4 border-4 shadow-[4px_4px_0px_0px_var(--foreground)]">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Gợi ý truy vấn
                </h3>
                <div className="space-y-2">
                    {[
                        "Báo cáo doanh thu hôm nay",
                        "Sản phẩm nào đang bán chạy?",
                        "Kiểm tra hàng tồn kho thấp",
                        "Thống kê người dùng mới",
                        "Các đơn hàng đang chờ xử lý"
                    ].map((text, i) => (
                        <button 
                            key={i}
                            onClick={() => setInput(text)}
                            className="w-full text-left p-3 text-[10px] font-bold uppercase bg-background border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]"
                        >
                            {text}
                        </button>
                    ))}
                </div>
            </div>

            <div className="solid-card bg-background p-4 border-4 shadow-[4px_4px_0px_0px_var(--foreground)] flex-1">
                 <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-500" /> Hệ thống Log
                </h3>
                <div className="text-[10px] font-mono space-y-1 opacity-60 overflow-hidden">
                    <p className="text-emerald-600">[OK] DB Connected</p>
                    <p className="text-emerald-600">[OK] Ollama API v2.5</p>
                    <p className="text-blue-600">[INFO] AI Context Loaded</p>
                    <p>[AUTH] Admin Session Valid</p>
                </div>
            </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col space-y-4 h-full">
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto solid-card bg-background p-6 space-y-6 border-4 shadow-[8px_8px_0px_0px_var(--foreground)]"
            >
                {messages.map((msg, idx) => (
                <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`flex max-w-[90%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 border-2 border-foreground flex-shrink-0 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] ${msg.role === 'user' ? 'bg-primary' : 'bg-foreground'}`}>
                        {msg.role === 'user' ? <Users className="w-6 h-6 text-primary-foreground" /> : <ShieldCheck className="w-6 h-6 text-background" />}
                    </div>
                    <div className="space-y-4 flex-1">
                        <div className={`p-5 border-2 border-foreground font-bold text-sm leading-relaxed shadow-[4px_4px_0px_0px_var(--foreground)] ${msg.role === 'user' ? 'bg-accent' : 'bg-secondary'}`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex justify-start">
                    <div className="flex space-x-3">
                    <div className="w-10 h-10 border-2 border-foreground bg-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
                        <ShieldCheck className="w-6 h-6 text-background" />
                    </div>
                    <div className="p-4 border-2 border-foreground bg-secondary shadow-[4px_4px_0px_0px_var(--foreground)]">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                    </div>
                </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="flex space-x-4 items-end">
                <div className="flex-1 relative">
                <textarea 
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                    }
                    }}
                    placeholder="Nhập lệnh điều khiển hoặc yêu cầu báo cáo..."
                    className="w-full bg-background border-4 border-foreground p-4 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all resize-none min-h-[60px] uppercase tracking-wider text-xs"
                />
                </div>
                <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="h-[60px] px-8 shadow-[4px_4px_0px_0px_var(--foreground)]"
                >
                <Send className="w-6 h-6" />
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
