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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/ai/admin/chatbot/history');
      if (res.data.success) {
        if (res.data.data.length > 0) {
          setMessages(res.data.data);
        } else {
          setMessages([{ role: 'assistant', content: 'Chào sếp! Em là Ultra Admin Assistant. Em đã sẵn sàng báo cáo số liệu và hỗ trợ sếp quản lý hệ thống. Sếp cần kiểm tra gì hôm nay ạ?' }]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin chat history', err);
      setMessages([{ role: 'assistant', content: 'Chào sếp! Em là Ultra Admin Assistant. Em đã sẵn sàng báo cáo số liệu và hỗ trợ sếp quản lý hệ thống. Sếp cần kiểm tra gì hôm nay ạ?' }]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleClearChat = async () => {
    if (!confirm('Sếp có chắc muốn xóa lịch sử trò chuyện không?')) return;
    try {
      const res = await api.delete('/ai/admin/chatbot/history');
      if (res.data.success) {
        setMessages([{ role: 'assistant', content: 'Chào sếp! Em là Ultra Admin Assistant. Em đã sẵn sàng báo cáo số liệu và hỗ trợ sếp quản lý hệ thống. Sếp cần kiểm tra gì hôm nay ạ?' }]);
      }
    } catch (err) {
      console.error('Failed to clear admin chat history', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-6 animate-fade-in-up">
      {/* Admin Header */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-[var(--radius-lg)] flex items-center justify-center border border-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl text-foreground flex items-center">
              Admin AI Command <Sparkles className="ml-2 w-5 h-5 text-primary" />
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">Hệ thống phân tích & Quản trị thông minh</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
            <div className="hidden md:flex flex-col items-end justify-center">
                <button 
                  onClick={handleClearChat}
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-danger transition-colors mb-1"
                >
                  [ Làm mới trò chuyện ]
                </button>
                <span className="text-xs font-semibold text-success flex items-center">
                    <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    Hệ thống ổn định
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        
        {/* Left Sidebar - Quick Actions */}
        <div className="hidden lg:flex flex-col space-y-4">
            <div className="card-elevated bg-card p-5 rounded-[var(--radius-xl)] border border-border">
                <h3 className="text-sm font-semibold mb-4 flex items-center text-foreground">
                    <LayoutDashboard className="w-4.5 h-4.5 mr-2 text-primary" /> Gợi ý truy vấn
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
                            className="w-full text-left p-3 text-xs font-medium bg-secondary/50 border border-border rounded-[var(--radius-md)] hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                        >
                            {text}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card-elevated bg-card p-5 rounded-[var(--radius-xl)] border border-border flex-1 flex flex-col">
                 <h3 className="text-sm font-semibold mb-4 flex items-center text-foreground">
                    <AlertCircle className="w-4.5 h-4.5 mr-2 text-warning" /> Hệ thống Log
                </h3>
                <div className="text-[11px] font-mono space-y-1.5 opacity-80 overflow-y-auto flex-1 p-3 bg-secondary/30 rounded-[var(--radius-md)] custom-scrollbar">
                    <p className="text-success">[OK] DB Connected</p>
                    <p className="text-success">[OK] Ollama API v2.5</p>
                    <p className="text-accent">[INFO] AI Context Loaded</p>
                    <p className="text-muted-foreground">[AUTH] Admin Session Valid</p>
                </div>
            </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col space-y-4 h-full">
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto card-elevated bg-card p-6 space-y-6 rounded-[var(--radius-xl)] border border-border custom-scrollbar"
            >
                {messages.map((msg, idx) => (
                <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                >
                    <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                        {msg.role === 'user' ? <Users className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div className="space-y-4 flex-1">
                        <div className={`p-4 text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-[var(--radius-lg)] rounded-tr-sm shadow-sm' 
                                : 'bg-secondary/50 text-foreground border border-border rounded-[var(--radius-lg)] rounded-tl-sm'
                        }`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex justify-start animate-pulse">
                    <div className="flex space-x-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="px-4 py-3 bg-secondary/50 border border-border rounded-[var(--radius-lg)] rounded-tl-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
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
                    placeholder="Nhập lệnh điều khiển hoặc yêu cầu báo cáo..."
                    className="w-full bg-card border border-border px-5 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[56px] rounded-full shadow-sm custom-scrollbar"
                />
                </div>
                <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="w-14 h-[56px] rounded-full flex items-center justify-center shrink-0 shadow-md hover:shadow-lg"
                >
                <Send className="w-5 h-5" />
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
