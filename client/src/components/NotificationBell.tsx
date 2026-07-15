'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Check, Loader2, Package, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { isAuthenticated, hasHydrated, resetAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useTranslation();

  const fetchNotifications = useCallback(async () => {
    try {
      if (!isOpen && notifications.length > 0) return;
      setIsLoading(true);
      const res = await api.get('/notifications?limit=10');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch {
      console.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, notifications.length]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    if (!localStorage.getItem('accessToken')) {
      resetAuth();
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [hasHydrated, isAuthenticated, isOpen, resetAuth, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((notification) => notification.id === id ? { ...notification, isRead: true } : notification));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-4.5 h-4.5 text-accent" />;
      case 'PROMOTION':
        return <Sparkles className="w-4.5 h-4.5 text-warning" />;
      default:
        return <AlertCircle className="w-4.5 h-4.5 text-primary" />;
    }
  };

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-[var(--radius-md)] hover:bg-secondary transition-colors"
        aria-label={t('notification.title')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger rounded-full text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 card-elevated rounded-[var(--radius-lg)] overflow-hidden z-50 shadow-lg">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{t('notification.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-primary hover:underline flex items-center"
              >
                <Check className="w-3 h-3 mr-1" /> {t('notification.markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                {t('notification.empty')}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className={`p-3.5 hover:bg-secondary cursor-pointer transition-colors flex gap-3 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-primary/10' : 'bg-secondary'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs mt-0.5 text-muted-foreground line-clamp-2">
                        {notification.content}
                      </p>
                      <span className="text-[10px] text-muted mt-1.5 block">
                        {new Date(notification.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : locale, { hour: '2-digit', minute: '2-digit' })}
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

          <div className="p-2 border-t border-border text-center">
            <Link href="/profile/notifications" className="text-xs font-medium text-primary hover:underline block py-2 transition-colors">
              {t('notification.viewAll')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
