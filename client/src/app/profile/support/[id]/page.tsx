'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Send, ArrowLeft, Loader2, Bot, User, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
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
  messages: Message[];
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.error('Không thể tải thông tin yêu cầu hỗ trợ');
      router.push('/profile/support');
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
      }
    } catch (err) {
      toast.error('Gửi phản hồi thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="font-black uppercase tracking-widest text-sm animate-pulse">Đang tải cuộc hội thoại...</p>
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 h-[80vh] flex flex-col pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-foreground pb-6">
        <div className="flex items-center space-x-4">
          <Button onClick={() => router.push('/profile/support')} variant="outline" size="sm" className="w-10 h-10 p-0 shadow-[2px_2px_0px_0px_var(--foreground)]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground line-clamp-1">{ticket.subject}</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: #{ticket.id.slice(0, 8)} • Trạng thái: <span className="text-primary">{ticket.status}</span></p>
          </div>
        </div>
        {ticket.status === 'RESOLVED' && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 px-4 py-2 font-black uppercase text-xs flex items-center shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Vấn đề đã được giải quyết
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto solid-card bg-accent p-6 space-y-6 border-4 shadow-[8px_8px_0px_0px_var(--foreground)]"
      >
        {ticket.messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          const isAdmin = msg.sender.role === 'ADMIN';

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
              <div className={`flex max-w-[85%] space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 border-2 border-foreground flex-shrink-0 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] ${isMe ? 'bg-primary' : (isAdmin ? 'bg-foreground' : 'bg-background')}`}>
                  {isMe ? <User className="w-6 h-6 text-primary-foreground" /> : (isAdmin ? <ShieldCheck className="w-6 h-6 text-background" /> : <User className="w-6 h-6 text-foreground" />)}
                </div>
                <div className="space-y-1">
                  <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${isMe ? 'justify-end' : ''}`}>
                    <span className="text-foreground">{msg.sender.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`p-4 border-2 border-foreground font-bold text-sm leading-relaxed shadow-[4px_4px_0px_0px_var(--foreground)] ${isMe ? 'bg-background text-foreground' : (isAdmin ? 'bg-foreground text-background' : 'bg-secondary text-foreground')}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      {ticket.status !== 'CLOSED' ? (
        <form onSubmit={handleReply} className="flex space-x-4 items-end animate-in slide-in-from-bottom-4 duration-500">
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
              placeholder="Nhập nội dung phản hồi..."
              className="w-full bg-background border-4 border-foreground p-4 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all resize-none min-h-[80px]"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !message.trim()}
            className="h-[80px] px-8 shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-y-1 transition-all"
          >
            <Send className="w-6 h-6" />
          </Button>
        </form>
      ) : (
        <div className="bg-muted p-6 border-4 border-foreground text-center font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_var(--foreground)] opacity-60 italic">
          Cuộc hội thoại này đã kết thúc và không thể phản hồi thêm.
        </div>
      )}
    </div>
  );
}
