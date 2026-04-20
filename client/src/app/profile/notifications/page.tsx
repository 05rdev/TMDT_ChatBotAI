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
      case 'ORDER': return <Package className="w-6 h-6 text-emerald-500" />;
      case 'PROMOTION': return <Sparkles className="w-6 h-6 text-yellow-500" />;
      default: return <AlertCircle className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-foreground pb-8">
        <div className="space-y-4">
          <Link href="/profile" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Quay lại hồ sơ
          </Link>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground flex items-center">
            Thông báo <Bell className="ml-4 w-10 h-10 text-primary" />
          </h1>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Cập nhật những tin tức mới nhất từ UltraShop</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex border-2 border-foreground bg-background p-1">
             <button 
               onClick={() => setFilter('ALL')}
               className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-foreground text-background' : 'hover:bg-accent'}`}
             >
               Tất cả
             </button>
             <button 
               onClick={() => setFilter('UNREAD')}
               className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${filter === 'UNREAD' ? 'bg-foreground text-background' : 'hover:bg-accent'}`}
             >
               Chưa đọc
             </button>
          </div>
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="border-2 shadow-[2px_2px_0px_0px_var(--foreground)] active:shadow-none active:translate-y-[2px]">
            Đọc tất cả
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <p className="font-black uppercase tracking-widest animate-pulse">Đang tải thông báo...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="solid-card bg-accent p-16 text-center border-4 border-foreground shadow-[12px_12px_0px_0px_var(--foreground)]">
          <Bell className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Trống trơn</h3>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Bạn chưa có thông báo nào vào lúc này.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`solid-card transition-all border-4 border-foreground shadow-[8px_8px_0px_0px_var(--foreground)] hover:shadow-[12px_12px_0px_0px_var(--foreground)] hover:-translate-x-1 hover:-translate-y-1 ${!notification.isRead ? 'bg-background' : 'bg-secondary/30'}`}
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className={`flex-shrink-0 w-16 h-16 border-2 border-foreground flex items-center justify-center shadow-[4px_4px_0px_0px_var(--foreground)] ${!notification.isRead ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-xl font-black uppercase tracking-tighter ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm font-bold leading-relaxed ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 hover:bg-emerald-500 hover:text-white border-2 border-transparent hover:border-foreground transition-all rounded-none"
                          title="Đánh dấu đã đọc"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-foreground transition-all rounded-none"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-4 border-t-2 border-foreground border-dashed">
                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1.5" />
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-foreground ${!notification.isRead ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'}`}>
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
