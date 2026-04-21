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
      case 'OPEN': return <span className="bg-warning/10 text-warning px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Mới</span>;
      case 'IN_PROGRESS': return <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><Clock className="w-3.5 h-3.5 mr-1" /> Đang xử lý</span>;
      case 'RESOLVED': return <span className="bg-success/10 text-success px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã giải quyết</span>;
      default: return <span className="bg-secondary text-muted-foreground px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><MessageSquare className="w-3.5 h-3.5 mr-1" /> Đã đóng</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group mb-2">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Quay lại hồ sơ
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground">Hỗ trợ khách hàng</h1>
          <p className="text-muted-foreground text-sm">Trao đổi trực tiếp với đội ngũ quản trị viên UltraShop</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="rounded-full shadow-md hover:shadow-lg">
          {showCreate ? <><ArrowLeft className="w-4 h-4 mr-2" /> Hủy bỏ</> : <><Plus className="w-4 h-4 mr-2" /> Tạo yêu cầu mới</>}
        </Button>
      </div>

      {showCreate ? (
        <div className="card-elevated bg-card p-8 rounded-[var(--radius-xl)] max-w-2xl mx-auto border border-border">
           <form onSubmit={handleCreate} className="space-y-6">
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Chủ đề cần hỗ trợ</label>
               <Input 
                 placeholder="Ví dụ: Lỗi đơn hàng #123, Tư vấn sản phẩm..." 
                 value={newTicket.subject} 
                 onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Nội dung chi tiết</label>
               <textarea 
                 rows={5}
                 placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..."
                 value={newTicket.message}
                 onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                 className="w-full bg-background border border-border p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none rounded-[var(--radius-md)]"
               />
             </div>
             <Button type="submit" isLoading={isSubmitting} className="w-full h-12">
               Gửi yêu cầu hỗ trợ <MessageSquare className="ml-2 w-4 h-4" />
             </Button>
           </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Đang tải lịch sử hỗ trợ...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="card-elevated bg-card rounded-[var(--radius-xl)] p-16 text-center space-y-5 border border-border">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto ring-4 ring-background shadow-sm">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-2xl text-foreground">Chưa có yêu cầu hỗ trợ nào</h3>
                <p className="text-sm text-muted-foreground">Nếu bạn gặp vấn đề gì, đừng ngần ngại liên hệ với chúng tôi!</p>
              </div>
              <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-2">Tạo yêu cầu đầu tiên</Button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/profile/support/${ticket.id}`}
                className="card-elevated bg-card rounded-[var(--radius-lg)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group hover:shadow-md transition-all border border-border"
              >
                <div className="flex items-start sm:items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${ticket.status === 'RESOLVED' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                    {ticket.status === 'RESOLVED' ? <CheckCircle2 className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">{ticket.subject}</h3>
                    <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                       <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {new Date(ticket.updatedAt).toLocaleDateString('vi-VN')}</span>
                       <span>•</span>
                       <span>ID: #{ticket.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                   {getStatusBadge(ticket.status)}
                   <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
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
