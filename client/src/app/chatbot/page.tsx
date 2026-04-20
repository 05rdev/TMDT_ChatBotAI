'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedProducts?: any[];
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/ai/chatbot/history');
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClearChat = async () => {
    if (!confirm('Bạn có chắc muốn xóa lịch sử trò chuyện không?')) return;
    try {
      const res = await api.delete('/ai/chatbot/history');
      if (res.data.success) {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to clear chat', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chatbot', { message: userMessage });
      const { message, suggestedProducts } = response.data.data;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: message,
        suggestedProducts: suggestedProducts
      }]);
    } catch (err) {
      console.error('Chat failed', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra khi kết nối với não bộ của em. Thử lại sau nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-foreground pb-6">
        <div className="flex items-center space-x-4">
          <Link href="/ai-hub">
            <Button variant="outline" size="sm" className="w-10 h-10 p-0 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground flex items-center">
              Ultra Assistant <Sparkles className="ml-2 w-6 h-6 text-primary animate-pulse" />
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chào mừng bạn đến với hệ thống chatbot AI</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-6">
          {isAuthenticated && (
            <button
              onClick={handleClearChat}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
            >
              [ Làm mới chat ]
            </button>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 border border-foreground rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Local AI Active</span>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto solid-card bg-accent p-6 space-y-6 scrollbar-thin scrollbar-thumb-foreground scrollbar-track-transparent border-4 shadow-[8px_8px_0px_0px_var(--foreground)]"
      >
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12" />
            <p className="font-bold uppercase tracking-widest text-sm">Bắt đầu trò chuyện với em nhé!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 border-2 border-foreground flex-shrink-0 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] ${msg.role === 'user' ? 'bg-primary' : 'bg-background'}`}>
                {msg.role === 'user' ? <User className="w-6 h-6 text-primary-foreground" /> : <Bot className="w-6 h-6 text-foreground" />}
              </div>
              <div className="space-y-4 flex-1">
                <div className={`p-4 border-2 border-foreground font-bold text-sm leading-relaxed shadow-[4px_4px_0px_0px_var(--foreground)] ${msg.role === 'user' ? 'bg-background text-foreground' : 'bg-secondary text-foreground'}`}>
                  {msg.content}
                </div>

                {/* Suggested Products */}
                {msg.role === 'assistant' && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    {msg.suggestedProducts.map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        className="flex items-center space-x-3 p-2 bg-background border-2 border-foreground hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_0px_var(--foreground)] group"
                      >
                        <div className="w-12 h-12 border border-foreground bg-accent flex-shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-all" />
                          ) : (
                            <Bot className="w-full h-full p-2 opacity-30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase text-foreground truncate">{p.name}</p>
                          <p className="text-[10px] font-bold text-primary">Xem chi tiết →</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex space-x-3">
              <div className="w-10 h-10 border-2 border-foreground bg-background flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
                <Bot className="w-6 h-6 text-foreground" />
              </div>
              <div className="p-4 border-2 border-foreground bg-secondary shadow-[4px_4px_0px_0px_var(--foreground)]">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="flex space-x-4 items-end pb-4">
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
            placeholder="Đặt câu hỏi về sản phẩm, mã giảm giá hoặc đơn hàng..."
            className="w-full bg-background border-4 border-foreground p-4 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all resize-none min-h-[60px]"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-[60px] px-8 shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-y-1 active:translate-x-[-1px] transition-all"
        >
          <Send className="w-6 h-6" />
        </Button>
      </form>
    </div>
  );
}
