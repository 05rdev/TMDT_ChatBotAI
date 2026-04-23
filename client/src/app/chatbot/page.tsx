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
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col space-y-6 py-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center space-x-4">
          <Link href="/ai-hub">
            <Button variant="outline" size="sm" className="rounded-full shrink-0 hover:bg-secondary transition-colors border-border shadow-sm w-10 h-10 p-0 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground flex items-center">
              Ultra Assistant <Sparkles className="ml-2 w-5 h-5 text-primary animate-pulse" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Trợ lý ảo mua sắm thông minh của bạn</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-6">
          {isAuthenticated && (
            <button
              onClick={handleClearChat}
              className="text-sm font-medium text-muted-foreground hover:text-danger transition-colors"
            >
              Làm mới trò chuyện
            </button>
          )}
          <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-foreground">Local AI Active</span>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-card rounded-[var(--radius-xl)] border border-border p-6 space-y-6 shadow-sm custom-scrollbar"
      >
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
            <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-2">
               <Bot className="w-8 h-8 text-primary" />
            </div>
            <p className="font-medium text-foreground text-lg">Xin chào! Em có thể giúp gì cho bạn hôm nay?</p>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">Bạn có thể hỏi về sản phẩm, mã giảm giá, trạng thái đơn hàng hoặc yêu cầu tư vấn mua sắm.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border text-foreground'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className="space-y-3 flex-1">
                <div className={`p-4 rounded-[var(--radius-lg)] text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 border border-border text-foreground'}`}>
                  {msg.content}
                </div>

                {/* Suggested Products */}
                {msg.role === 'assistant' && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    {msg.suggestedProducts.map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        className="flex items-center space-x-3 p-2 bg-card rounded-[var(--radius-md)] border border-border hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden"
                      >
                        <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-secondary flex-shrink-0 overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <Bot className="w-full h-full p-2 opacity-30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs font-medium text-primary mt-0.5 group-hover:underline">Xem chi tiết →</p>
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
              <div className="w-10 h-10 rounded-full border border-border bg-secondary flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-foreground" />
              </div>
              <div className="px-4 py-3 rounded-[var(--radius-lg)] border border-border bg-secondary/50 shadow-sm flex items-center space-x-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Đang suy nghĩ...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="flex space-x-3 items-end">
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
            placeholder="Nhập tin nhắn hoặc yêu cầu của bạn..."
            className="w-full bg-card border border-border rounded-[var(--radius-lg)] px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[52px] shadow-sm custom-scrollbar"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-[52px] px-6 rounded-[var(--radius-lg)] shadow-sm flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
