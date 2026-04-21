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
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="font-medium text-sm text-muted-foreground animate-pulse">Đang tải cuộc hội thoại...</p>
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 h-[80vh] flex flex-col pb-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center space-x-4">
          <Button onClick={() => router.push('/profile/support')} variant="outline" size="sm" className="w-10 h-10 p-0 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading text-foreground line-clamp-1">{ticket.subject}</h1>
            <p className="text-[11px] font-medium text-muted-foreground mt-1">
              ID: #{ticket.id.slice(0, 8)} • Trạng thái: <span className="text-primary font-semibold">{ticket.status}</span>
            </p>
          </div>
        </div>
        {ticket.status === 'RESOLVED' && (
          <div className="bg-success/10 text-success px-4 py-2 rounded-full font-semibold text-[11px] flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Vấn đề đã được giải quyết
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto card-elevated bg-card p-6 space-y-6 border border-border rounded-[var(--radius-xl)] custom-scrollbar"
      >
        {ticket.messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          const isAdmin = msg.sender.role === 'ADMIN';

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
              <div className={`flex max-w-[85%] space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-border ${isMe ? 'bg-primary border-primary/20' : (isAdmin ? 'bg-accent/10 border-accent/20' : 'bg-secondary')}`}>
                  {isMe ? <User className="w-5 h-5 text-primary-foreground" /> : (isAdmin ? <ShieldCheck className="w-5 h-5 text-accent" /> : <User className="w-5 h-5 text-foreground" />)}
                </div>
                <div className="space-y-1.5">
                  <div className={`flex items-center space-x-2 text-[11px] font-medium text-muted-foreground ${isMe ? 'justify-end' : ''}`}>
                    <span className="text-foreground">{msg.sender.name}</span>
                    <span>•</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`p-4 text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-[var(--radius-lg)] rounded-tr-sm shadow-sm' 
                      : (isAdmin ? 'bg-secondary/60 border border-border text-foreground rounded-[var(--radius-lg)] rounded-tl-sm' : 'bg-secondary/30 border border-border/50 text-foreground rounded-[var(--radius-lg)] rounded-tl-sm')
                  }`}>
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
        <form onSubmit={handleReply} className="flex space-x-3 items-end animate-in slide-in-from-bottom-4 duration-500">
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
              className="w-full bg-card border border-border p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[60px] rounded-[var(--radius-xl)] shadow-sm"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !message.trim()}
            className="h-[60px] w-16 rounded-[var(--radius-xl)] flex justify-center items-center shrink-0 shadow-md hover:shadow-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      ) : (
        <div className="bg-secondary/50 p-6 rounded-[var(--radius-xl)] text-center text-muted-foreground text-sm border border-border italic">
          Cuộc hội thoại này đã kết thúc và không thể phản hồi thêm.
        </div>
      )}
    </div>
  );
}
