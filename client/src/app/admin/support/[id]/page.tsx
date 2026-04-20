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
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
      <p className="font-black uppercase tracking-widest text-lg animate-pulse">Đang tải cuộc hội thoại...</p>
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header Area */}
      <header className="p-6 border-b-4 border-foreground bg-accent flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button onClick={() => router.push('/admin/support')} variant="outline" className="w-10 h-10 p-0 border-2 shadow-[2px_2px_0px_0px_var(--foreground)]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
               <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground line-clamp-1">{ticket.subject}</h1>
               <span className="bg-foreground text-background px-2 py-0.5 text-[10px] font-black uppercase">{ticket.status}</span>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Khách hàng: <span className="text-foreground">{ticket.user.name} ({ticket.user.email})</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => updateStatus('IN_PROGRESS')} 
            variant="outline" 
            disabled={isUpdatingStatus || ticket.status === 'IN_PROGRESS'}
            size="sm"
            className="border-2 shadow-[2px_2px_0px_0px_var(--foreground)]"
          >
            Đang xử lý
          </Button>
          <Button 
            onClick={() => updateStatus('RESOLVED')} 
            className="bg-emerald-500 hover:bg-emerald-600 border-2 shadow-[2px_2px_0px_0px_var(--foreground)]"
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
            className="border-2 shadow-[2px_2px_0px_0px_var(--foreground)]"
          >
            Đóng vĩnh viễn
          </Button>
        </div>
      </header>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 bg-background scrollbar-thin scrollbar-thumb-foreground"
        >
          {ticket.messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const isTargetUser = msg.sender.role === 'USER' && msg.senderId !== currentUser?.id;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`flex max-w-[80%] space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 border-2 border-foreground flex-shrink-0 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] ${isMe ? 'bg-foreground' : 'bg-accent'}`}>
                    {isMe ? <ShieldCheck className="w-6 h-6 text-background" /> : <User className="w-6 h-6 text-foreground" />}
                  </div>
                  <div className="space-y-1">
                    <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${isMe ? 'justify-end' : ''}`}>
                      <span className="text-foreground">{msg.sender.name} {isMe ? '(Bạn)' : ''}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(msg.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className={`p-5 border-4 border-foreground font-bold text-sm leading-relaxed shadow-[6px_6px_0px_0px_var(--foreground)] ${isMe ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Info */}
        <div className="hidden lg:block w-80 border-l-4 border-foreground bg-accent p-8 space-y-8 overflow-y-auto">
           <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest flex items-center"><User className="w-4 h-4 mr-2" /> Hồ sơ khách hàng</h4>
              <div className="solid-card bg-background p-4 border-2 space-y-2">
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tên:</p>
                 <p className="font-black text-sm uppercase">{ticket.user.name}</p>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4">Email:</p>
                 <p className="font-bold text-xs truncate">{ticket.user.email}</p>
              </div>
           </div>

           <div className="space-y-4 pt-8 border-t-2 border-foreground border-dashed">
              <h4 className="text-sm font-black uppercase tracking-widest flex items-center"><Settings className="w-4 h-4 mr-2" /> Thông tin bổ sung</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Phản hồi gần nhất:</span>
                    <span className="text-[10px] font-black uppercase">Vừa xong</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Mức độ ưu tiên:</span>
                    <span className="text-[10px] font-black uppercase text-primary">Trung bình</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Input Footer */}
      <footer className="p-6 border-t-4 border-foreground bg-accent">
        <form onSubmit={handleReply} className="max-w-6xl mx-auto flex space-x-6 items-end">
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
              className="w-full bg-background border-4 border-foreground p-4 font-bold text-foreground focus:outline-none focus:ring-0 focus:border-primary transition-all resize-none shadow-[4px_4px_0px_0px_var(--foreground)]"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !message.trim() || ticket.status === 'CLOSED'}
            className="h-full px-10 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-y-1 active:shadow-none transition-all"
          >
            Gửi phản hồi <Send className="ml-3 w-5 h-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
