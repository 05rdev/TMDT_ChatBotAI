'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Send, ArrowLeft, Loader2, Bot, User, CheckCircle2, ShieldCheck, Clock, Settings, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { name: string; role: string };
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  user: { name: string; email: string };
  messages: Message[];
}

export default function AdminTicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket?.messages]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/support/${id}`);
      if (res.data.success) {
        setTicket(res.data.data);
      }
    } catch (err) {
      toast.error('Không tìm thấy yêu cầu hỗ trợ');
      router.push('/admin/support');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/support/${id}/reply`, { content: message });
      if (res.data.success) {
        setTicket(prev => prev ? {
          ...prev,
          messages: [...prev.messages, res.data.data]
        } : null);
        setMessage('');
        
        // Tự động chuyển sang IN_PROGRESS nếu đang OPEN
        if (ticket?.status === 'OPEN') {
           updateStatus('IN_PROGRESS');
        }
      }
    } catch (err) {
      toast.error('Gửi phản hồi thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.put(`/support/${id}/status`, { status });
      if (res.data.success) {
        setTicket(prev => prev ? { ...prev, status: status } : null);
        toast.success(`Đã cập nhật trạng thái: ${status}`);
      }
    } catch (err) {
      toast.error('Cập nhật trạng thái thất bại');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) return (
    <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="font-medium text-sm text-muted-foreground animate-pulse">Đang tải cuộc hội thoại...</p>
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-background animate-fade-in-up">
      {/* Header Area */}
      <header className="px-6 py-5 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button onClick={() => router.push('/admin/support')} variant="outline" className="w-10 h-10 p-0 rounded-full shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
               <h1 className="text-xl font-heading text-foreground line-clamp-1">{ticket.subject}</h1>
               <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold">{ticket.status}</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Khách hàng: <span className="text-foreground">{ticket.user.name} ({ticket.user.email})</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={() => updateStatus('IN_PROGRESS')} 
            variant="outline" 
            disabled={isUpdatingStatus || ticket.status === 'IN_PROGRESS'}
            size="sm"
            className="rounded-full"
          >
            Đang xử lý
          </Button>
          <Button 
            onClick={() => updateStatus('RESOLVED')} 
            className="bg-success hover:bg-success/90 text-white rounded-full"
            disabled={isUpdatingStatus || ticket.status === 'RESOLVED'}
            size="sm"
          >
            Đã xong
          </Button>
          <Button 
            onClick={() => updateStatus('CLOSED')} 
            variant="destructive"
            disabled={isUpdatingStatus || ticket.status === 'CLOSED'}
            size="sm"
            className="rounded-full"
          >
            Đóng
          </Button>
        </div>
      </header>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-secondary/10 custom-scrollbar"
        >
          {ticket.messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`flex max-w-[80%] space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-border ${isMe ? 'bg-primary border-primary/20' : 'bg-secondary'}`}>
                    {isMe ? <ShieldCheck className="w-5 h-5 text-primary-foreground" /> : <User className="w-5 h-5 text-foreground" />}
                  </div>
                  <div className="space-y-1.5">
                    <div className={`flex items-center space-x-2 text-[11px] font-medium text-muted-foreground ${isMe ? 'justify-end' : ''}`}>
                      <span className="text-foreground">{msg.sender.name} {isMe ? '(Bạn)' : ''}</span>
                      <span>•</span>
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(msg.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className={`p-4 text-sm leading-relaxed ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-[var(--radius-lg)] rounded-tr-sm shadow-sm' 
                        : 'bg-card border border-border text-foreground rounded-[var(--radius-lg)] rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Info */}
        <div className="hidden lg:block w-80 border-l border-border bg-card p-6 overflow-y-auto">
           <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest flex items-center text-muted-foreground mb-4"><User className="w-4 h-4 mr-2" /> Hồ sơ khách hàng</h4>
              <div className="bg-secondary/30 p-4 rounded-[var(--radius-lg)] border border-border/50 space-y-3">
                 <div>
                   <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Tên</p>
                   <p className="font-semibold text-sm text-foreground">{ticket.user.name}</p>
                 </div>
                 <div>
                   <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                   <p className="font-medium text-sm text-foreground truncate">{ticket.user.email}</p>
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-8 mt-8 border-t border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-widest flex items-center text-muted-foreground mb-4"><Settings className="w-4 h-4 mr-2" /> Thông tin bổ sung</h4>
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Phản hồi gần nhất</span>
                    <span className="text-xs font-semibold text-foreground">Vừa xong</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Mức độ ưu tiên</span>
                    <span className="text-xs font-semibold text-primary">Trung bình</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Input Footer */}
      <footer className="p-4 border-t border-border bg-card">
        <form onSubmit={handleReply} className="max-w-4xl mx-auto flex space-x-3 items-end">
          <div className="flex-1 relative">
            <textarea 
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReply(e);
                }
              }}
              placeholder="Nhập nội dung phản hồi cho khách hàng..."
              className="w-full bg-secondary/30 border border-border p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none rounded-[var(--radius-xl)] shadow-sm min-h-[60px]"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !message.trim() || ticket.status === 'CLOSED'}
            className="h-[60px] px-8 rounded-[var(--radius-xl)] shadow-md hover:shadow-lg"
          >
            Gửi <Send className="ml-2 w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
