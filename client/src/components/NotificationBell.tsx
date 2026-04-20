'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Loader2, Package, Sparkles, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!isOpen && notifications.length > 0) return; // Don't fetch if closed and already have data, except initial count load
      setIsLoading(true);
      const res = await api.get('/notifications?limit=10');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <Package className="w-5 h-5 text-emerald-500" />;
      case 'PROMOTION': return <Sparkles className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-primary" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-foreground text-white text-[10px] font-black flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_var(--foreground)] z-50">
          <div className="p-4 bg-accent border-b-4 border-foreground flex items-center justify-between">
            <h3 className="font-black text-lg uppercase tracking-tighter">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center"
              >
                <Check className="w-3 h-3 mr-1" /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm">
                Bạn chưa có thông báo nào.
              </div>
            ) : (
              <div className="divide-y-2 divide-foreground">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className={`p-4 hover:bg-secondary cursor-pointer transition-colors flex gap-3 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center ${!notification.isRead ? 'bg-background' : 'bg-accent'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs mt-1 text-muted-foreground line-clamp-2">
                        {notification.content}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 block">
                        {new Date(notification.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 bg-accent border-t-4 border-foreground text-center">
            <Link href="/profile/notifications" className="text-xs font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors block py-2">
              Xem tất cả thông báo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
