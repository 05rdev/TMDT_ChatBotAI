'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { MessageSquare, Loader2, Clock, CheckCircle2, Search, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  user: { name: string };
  messages: any[];
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/support${filterStatus ? `?status=${filterStatus}` : ''}`);
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách yêu cầu hỗ trợ');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-1 text-[10px] font-black uppercase">Mới</span>;
      case 'IN_PROGRESS': return <span className="bg-primary/10 text-primary border border-primary/30 px-2 py-1 text-[10px] font-black uppercase">Đang xử lý</span>;
      case 'RESOLVED': return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/30 px-2 py-1 text-[10px] font-black uppercase">Đã xong</span>;
      default: return <span className="bg-muted text-muted-foreground border border-border px-2 py-1 text-[10px] font-black uppercase">Đã đóng</span>;
    }
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-foreground pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground flex items-center">
            Quản lý Hỗ trợ <MessageSquare className="ml-4 w-10 h-10 text-primary" />
          </h1>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Phản hồi và xử lý các yêu cầu từ khách hàng</p>
        </div>

        <div className="flex items-center gap-4 bg-accent p-2 border-4 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)]">
           <Filter className="w-5 h-5 ml-2 text-foreground" />
           <select 
             value={filterStatus} 
             onChange={(e) => setFilterStatus(e.target.value)}
             className="bg-transparent font-black uppercase tracking-widest text-xs focus:outline-none p-2 cursor-pointer"
           >
             <option value="">Tất cả trạng thái</option>
             <option value="OPEN">Chưa xử lý</option>
             <option value="IN_PROGRESS">Đang xử lý</option>
             <option value="RESOLVED">Đã giải quyết</option>
             <option value="CLOSED">Đã đóng</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <p className="text-xl font-black uppercase tracking-widest animate-pulse">Đang tải dữ liệu yêu cầu...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="h-[400px] solid-card bg-background flex flex-col items-center justify-center space-y-6 text-center border-4">
             <CheckCircle2 className="w-20 h-20 text-emerald-500 opacity-20" />
             <h3 className="text-3xl font-black uppercase tracking-tighter">Tuyệt vời!</h3>
             <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Hiện không có yêu cầu hỗ trợ nào cần xử lý.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="solid-card bg-background border-4 shadow-[8px_8px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_var(--foreground)] transition-all flex flex-col group overflow-hidden"
              >
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(ticket.status)}
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">#{ticket.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tight line-clamp-1">{ticket.subject}</h3>
                    </div>
                    <div className="w-10 h-10 border-2 border-foreground bg-accent flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-secondary p-4 border-2 border-foreground border-dashed">
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Khách hàng:</p>
                     <p className="font-black text-foreground uppercase">{ticket.user.name}</p>
                  </div>

                  <div className="flex items-center space-x-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    <span>Cập nhật: {new Date(ticket.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                <Link href={`/admin/support/${ticket.id}`} className="block">
                  <button className="w-full bg-foreground text-background py-4 font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2">
                    Xử lý yêu cầu <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
