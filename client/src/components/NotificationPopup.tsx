'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, Clock, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationPopup() {
  const { isAuthenticated, user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check localStorage for dismissed time
    const dismissedUntil = localStorage.getItem('notif_dismissed_until');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    fetchUnreadNotifications();
  }, [isAuthenticated]);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        const toShow = (res.data.data.notifications || []).filter(
          (n: Notification) => {
            // Hiển thị các thông báo chưa đọc (như Đơn hàng)
            if (!n.isRead) return true;
            // Với thông báo Hệ thống và Khuyến mãi, LUÔN hiển thị dù đã đọc (trừ khi user chọn Nhắc tôi sau 1h)
            if (n.type === 'SYSTEM' || n.type === 'PROMOTION') return true;
            return false;
          }
        );
        if (toShow.length > 0) {
          setNotifications(toShow);
          // Small delay for entrance animation
          setTimeout(() => {
            setIsVisible(true);
            setIsAnimating(true);
          }, 800);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications for popup', err);
    }
  };

  const handleDismiss = async () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);

    // Mark current notification as read
    const current = notifications[currentIndex];
    if (current) {
      try {
        await api.put(`/notifications/${current.id}/read`);
      } catch {}
    }
  };

  const handleDismissFor1Hour = () => {
    const oneHourFromNow = Date.now() + 60 * 60 * 1000;
    localStorage.setItem('notif_dismissed_until', String(oneHourFromNow));
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
    } catch {}
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible || notifications.length === 0) return null;

  const current = notifications[currentIndex];

  const typeColors: Record<string, string> = {
    PROMOTION: 'bg-warning/10 text-warning border-warning/20',
    SYSTEM: 'bg-primary/10 text-primary border-primary/20',
    ORDER: 'bg-accent/10 text-accent border-accent/20',
    DEFAULT: 'bg-secondary text-foreground border-border',
  };

  const typeColor = typeColors[current.type] || typeColors.DEFAULT;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md bg-card border border-border rounded-[var(--radius-xl)] shadow-2xl transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Thông báo mới</h3>
              <p className="text-[11px] text-muted-foreground">
                {notifications.length > 1 
                  ? `${currentIndex + 1}/${notifications.length} thông báo`
                  : 'Dành cho bạn'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Type Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeColor}`}>
            <Volume2 className="w-3 h-3" />
            {current.type === 'PROMOTION' ? 'Khuyến mãi' : current.type === 'ORDER' ? 'Đơn hàng' : 'Hệ thống'}
          </span>

          <div className="space-y-2">
            <h4 className="text-lg font-bold text-foreground leading-tight">{current.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.content}</p>
          </div>

          <p className="text-[11px] text-muted-foreground/60">
            {new Date(current.createdAt).toLocaleString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-border space-y-2">
          <div className="flex gap-2">
            {notifications.length > 1 && currentIndex < notifications.length - 1 ? (
              <Button
                onClick={() => {
                  // Mark current as read and go to next
                  api.put(`/notifications/${current.id}/read`).catch(() => {});
                  setCurrentIndex(i => i + 1);
                }}
                className="flex-1 rounded-[var(--radius-md)]"
              >
                Xem tiếp ({notifications.length - currentIndex - 1})
              </Button>
            ) : (
              <Button
                onClick={handleMarkAllRead}
                className="flex-1 rounded-[var(--radius-md)]"
              >
                Đã hiểu
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleDismissFor1Hour}
              className="flex-1 rounded-[var(--radius-md)] gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              Nhắc tôi sau 1h
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
