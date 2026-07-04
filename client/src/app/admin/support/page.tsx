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
      case 'OPEN': return <span className="bg-warning/10 text-warning px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Mới</span>;
      case 'IN_PROGRESS': return <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><Clock className="w-3.5 h-3.5 mr-1" /> Đang xử lý</span>;
      case 'RESOLVED': return <span className="bg-success/10 text-success px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã xong</span>;
      default: return <span className="bg-secondary text-muted-foreground px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit">Đã đóng</span>;
    }
  };

  return (
    <div className="admin-page animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <h1 className="admin-title flex items-center">
            Quản lý Hỗ trợ
          </h1>
          <p className="text-muted-foreground text-sm">Phản hồi và xử lý các yêu cầu từ khách hàng</p>
        </div>

        <div className="flex items-center gap-3 bg-card border border-border rounded-[8px] p-1.5 shadow-sm w-full sm:w-auto">
           <Filter className="w-4 h-4 ml-2 text-muted-foreground" />
           <select 
             value={filterStatus} 
             onChange={(e) => setFilterStatus(e.target.value)}
             className="bg-transparent text-sm font-medium focus:outline-none p-1.5 cursor-pointer text-foreground appearance-none pr-8 w-full sm:w-auto"
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
          <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu yêu cầu...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="h-[360px] admin-card flex flex-col items-center justify-center space-y-5 text-center px-4">
             <div className="w-16 h-16 bg-success/10 rounded-[8px] flex items-center justify-center">
               <CheckCircle2 className="w-8 h-8 text-success" />
             </div>
             <div className="space-y-1">
               <h3 className="font-heading text-2xl text-foreground">Tuyệt vời!</h3>
               <p className="text-muted-foreground text-sm">Hiện không có yêu cầu hỗ trợ nào cần xử lý.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="admin-card hover:shadow-md transition-shadow flex flex-col group overflow-hidden relative"
              >
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                <div className="p-4 sm:p-6 space-y-5 flex-1 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(ticket.status)}
                        <span className="text-[11px] font-medium text-muted-foreground">#{ticket.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{ticket.subject}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-[8px] border border-border/50">
                     <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Khách hàng</p>
                     <p className="font-semibold text-foreground">{ticket.user.name}</p>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] font-medium text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cập nhật: {new Date(ticket.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                <Link href={`/admin/support/${ticket.id}`} className="block mt-auto relative z-10 border-t border-border">
                  <button className="w-full bg-secondary/20 text-foreground py-3.5 font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2">
                    Xử lý yêu cầu <ArrowRight className="w-4 h-4" />
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
