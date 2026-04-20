'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { MessageSquare, Plus, Loader2, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  updatedAt: string;
  messages: any[];
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/support/my');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách yêu cầu hỗ trợ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return toast.error('Vui lòng điền đủ thông tin');

    setIsSubmitting(true);
    try {
      const res = await api.post('/support', newTicket);
      if (res.data.success) {
        toast.success('Gửi yêu cầu hỗ trợ thành công');
        setShowCreate(false);
        setNewTicket({ subject: '', message: '' });
        fetchTickets();
      }
    } catch (err) {
      toast.error('Gửi yêu cầu thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-1 text-[10px] font-black uppercase">Mới</span>;
      case 'IN_PROGRESS': return <span className="bg-primary/10 text-primary border border-primary/30 px-2 py-1 text-[10px] font-black uppercase">Đang xử lý</span>;
      case 'RESOLVED': return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/30 px-2 py-1 text-[10px] font-black uppercase">Đã giải quyết</span>;
      default: return <span className="bg-muted text-muted-foreground border border-border px-2 py-1 text-[10px] font-black uppercase">Đã đóng</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-foreground pb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">Hỗ trợ khách hàng</h1>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-[10px]">Trao đổi trực tiếp với đội ngũ quản trị viên UltraShop</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-y-1 active:shadow-none">
          {showCreate ? <><ArrowLeft className="w-4 h-4 mr-2" /> Quay lại</> : <><Plus className="w-4 h-4 mr-2" /> Tạo yêu cầu mới</>}
        </Button>
      </div>

      {showCreate ? (
        <div className="solid-card bg-background p-8 max-w-2xl mx-auto border-4 shadow-[12px_12px_0px_0px_var(--foreground)]">
           <form onSubmit={handleCreate} className="space-y-6">
             <div className="space-y-2">
               <label className="text-sm font-black uppercase tracking-widest text-foreground">Chủ đề cần hỗ trợ</label>
               <Input 
                 placeholder="Ví dụ: Lỗi đơn hàng #123, Tư vấn sản phẩm..." 
                 value={newTicket.subject} 
                 onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-black uppercase tracking-widest text-foreground">Nội dung chi tiết</label>
               <textarea 
                 rows={5}
                 placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..."
                 value={newTicket.message}
                 onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                 className="w-full bg-background border-4 border-foreground p-4 font-bold text-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all resize-none"
               />
             </div>
             <Button type="submit" isLoading={isSubmitting} className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--foreground)]">
               Gửi yêu cầu hỗ trợ <MessageSquare className="ml-2 w-5 h-5" />
             </Button>
           </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-black uppercase tracking-widest animate-pulse">Đang tải lịch sử hỗ trợ...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="solid-card bg-accent p-12 text-center space-y-6 border-4 shadow-[8px_8px_0px_0px_var(--foreground)]">
              <div className="w-20 h-20 bg-background border-4 border-foreground flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_var(--foreground)]">
                <MessageSquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Chưa có yêu cầu hỗ trợ nào</h3>
                <p className="text-sm text-muted-foreground font-bold tracking-widest uppercase">Nếu bạn gặp vấn đề gì, đừng ngần ngại liên hệ với chúng tôi!</p>
              </div>
              <Button onClick={() => setShowCreate(true)}>Tạo yêu cầu đầu tiên</Button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/profile/support/${ticket.id}`}
                className="solid-card bg-background p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:-translate-y-1 transition-all border-4 shadow-[4px_4px_0px_0px_var(--foreground)] hover:shadow-[8px_8px_0px_0px_var(--foreground)]"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] ${ticket.status === 'RESOLVED' ? 'bg-emerald-500/20' : 'bg-accent'}`}>
                    {ticket.status === 'RESOLVED' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <MessageSquare className="w-6 h-6 text-foreground" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-lg text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{ticket.subject}</h3>
                    <div className="flex items-center space-x-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                       <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(ticket.updatedAt).toLocaleDateString('vi-VN')}</span>
                       <span>•</span>
                       <span>ID: #{ticket.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                   {getStatusBadge(ticket.status)}
                   <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] group-hover:bg-foreground group-hover:text-background transition-all">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                   </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
