'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Chào bạn! Mình là Ultra Assistant. Mình có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Giả sử backend có endpoint /ai/chat
      const response = await api.post('/ai/chat', { message: userMessage });
      const botReply = response.data.data?.reply || response.data.reply || 'Dạ, em chưa hiểu ý anh/chị lắm. Anh/chị có thể nói rõ hơn không ạ?';
      
      setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
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
            <Button variant="outline" size="icon" className="w-10 h-10 shadow-[2px_2px_0px_0px_var(--foreground)]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground flex items-center">
              Ultra Assistant <Sparkles className="ml-2 w-6 h-6 text-primary animate-pulse" />
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phản hồi ngay lập tức bởi RAG AI</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 border border-foreground rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Hệ thống trực tuyến</span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto solid-card bg-accent p-6 space-y-6 scrollbar-thin scrollbar-thumb-foreground scrollbar-track-transparent"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[80%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 border-2 border-foreground flex-shrink-0 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] ${msg.role === 'user' ? 'bg-primary' : 'bg-background'}`}>
                {msg.role === 'user' ? <User className="w-6 h-6 text-primary-foreground" /> : <Bot className="w-6 h-6 text-foreground" />}
              </div>
              <div className={`p-4 border-2 border-foreground font-bold text-sm leading-relaxed shadow-[4px_4px_0px_0px_var(--foreground)] ${msg.role === 'user' ? 'bg-background text-foreground' : 'bg-secondary text-foreground'}`}>
                {msg.content}
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
            placeholder="Đặt câu hỏi cho AI..."
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
