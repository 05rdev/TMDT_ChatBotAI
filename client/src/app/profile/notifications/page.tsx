'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { 
  Bell, 
  Package, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, filter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const url = filter === 'UNREAD' ? '/notifications?unreadOnly=true' : '/notifications';
      const res = await api.get(url);
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
      }
    } catch (error) {
      toast.error('Không thể tải thông báo');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      toast.error('Lỗi khi cập nhật');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Đã xóa thông báo');
    } catch (error) {
      toast.error('Lỗi khi xóa thông báo');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <Package className="w-5 h-5 text-success" />;
      case 'PROMOTION': return <Sparkles className="w-5 h-5 text-warning" />;
      default: return <AlertCircle className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-border">
        <div className="space-y-3">
          <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Quay lại hồ sơ
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground flex items-center">
            Thông báo <Bell className="ml-3 w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">Cập nhật những tin tức mới nhất từ UltraShop</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-secondary/50 p-1 rounded-[var(--radius-lg)] border border-border">
             <button 
               onClick={() => setFilter('ALL')}
               className={`px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-all ${filter === 'ALL' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
             >
               Tất cả
             </button>
             <button 
               onClick={() => setFilter('UNREAD')}
               className={`px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-all ${filter === 'UNREAD' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
             >
               Chưa đọc
             </button>
          </div>
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="rounded-[var(--radius-lg)] h-9">
            Đọc tất cả
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Đang tải thông báo...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card-elevated bg-card rounded-[var(--radius-xl)] p-16 text-center border border-border shadow-sm">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-30" />
          <h3 className="font-heading text-2xl text-foreground mb-2">Trống trơn</h3>
          <p className="text-muted-foreground text-sm">Bạn chưa có thông báo nào vào lúc này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`card-elevated rounded-[var(--radius-xl)] transition-all border border-border hover:shadow-md ${!notification.isRead ? 'bg-card' : 'bg-secondary/20 shadow-none'}`}
            >
              <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-5">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className={`text-base font-semibold line-clamp-1 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${!notification.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                        {notification.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-muted-foreground hover:bg-success/10 hover:text-success transition-all rounded-[var(--radius-md)]"
                          title="Đánh dấu đã đọc"
                        >
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-all rounded-[var(--radius-md)]"
                        title="Xóa"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-border/50">
                    <span className="flex items-center text-xs font-medium text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${!notification.isRead ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {notification.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
