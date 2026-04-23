'use client';

import React, { useState } from 'react';
import { Save, Globe, Lock, Bell, Store, Send, Users, User, Megaphone, Loader2, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Chung', icon: Store },
    { id: 'notifications', name: 'Thông báo', icon: Bell },
    { id: 'security', name: 'Bảo mật', icon: Lock },
    { id: 'advanced', name: 'Nâng cao', icon: Globe },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up">
      {/* Sidebar Settings Tabs */}
      <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-5 py-3.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="flex-1 card-elevated bg-card rounded-[var(--radius-xl)] border border-border p-6 sm:p-10">
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab !== 'general' && activeTab !== 'notifications' && (
          <div className="min-h-[300px] flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
              <Globe className="w-8 h-8 text-muted-foreground animate-spin-slow" />
            </div>
            <h2 className="font-heading text-2xl text-foreground">Tính năng đang phát triển</h2>
            <p className="text-muted-foreground text-sm">Tab cài đặt này sẽ sớm ra mắt trong phiên bản tiếp theo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="border-b border-border pb-6">
        <h2 className="font-heading text-2xl text-foreground mb-1.5">Cài đặt chung</h2>
        <p className="text-muted-foreground text-sm">Quản lý thông tin cơ bản của cửa hàng.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Tên cửa hàng</label>
          <input 
            type="text" 
            defaultValue="UltraShop - Neo E-commerce"
            className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Email liên hệ</label>
          <input 
            type="email" 
            defaultValue="contact@ultrashop.com"
            className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Số điện thoại hotline</label>
          <input 
            type="text" 
            defaultValue="0123 456 789"
            className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="pt-4 space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Chế độ bảo trì</span>
              <p className="text-xs text-muted-foreground leading-relaxed">Kích hoạt để tạm ẩn cửa hàng đối với khách hàng (chỉ admin truy cập được).</p>
            </div>
            <div className="relative shrink-0">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-8 border-t border-border mt-8">
        <Button className="rounded-full px-8">
          <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [section, setSection] = useState<'send' | 'manage'>('send');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-1.5">Thông báo hệ thống</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý và gửi thông báo đến người dùng.
          </p>
        </div>
        <div className="flex bg-secondary p-1 rounded-[var(--radius-lg)] shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSection('send')}
            className={`px-4 py-2 text-sm font-semibold rounded-[var(--radius-md)] transition-all ${section === 'send' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Gửi thông báo
          </button>
          <button
            onClick={() => setSection('manage')}
            className={`px-4 py-2 text-sm font-semibold rounded-[var(--radius-md)] transition-all ${section === 'manage' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Lịch sử
          </button>
        </div>
      </div>

      {section === 'send' ? <NotificationSender /> : <NotificationList />}
    </div>
  );
}

function NotificationList() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNotif, setEditingNotif] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', type: 'SYSTEM' });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications/admin/all');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      toast.error('Lỗi khi tải lịch sử thông báo');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success('Đã xóa thông báo');
      fetchNotifications();
    } catch (err) {
      toast.error('Xóa thông báo thất bại');
    }
  };

  const handleEdit = (notif: any) => {
    setEditingNotif(notif.id);
    setEditForm({ title: notif.title, content: notif.content, type: notif.type });
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/notifications/admin/${editingNotif}`, editForm);
      toast.success('Đã cập nhật thông báo');
      setEditingNotif(null);
      fetchNotifications();
    } catch (err) {
      toast.error('Cập nhật thất bại');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-secondary/30 rounded-[var(--radius-lg)] border border-border border-dashed">
          Chưa có thông báo nào được gửi.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notifications.map(notif => (
            <div key={notif.id} className="p-5 bg-card border border-border rounded-[var(--radius-lg)] flex flex-col sm:flex-row gap-4 justify-between items-start">
              {editingNotif === notif.id ? (
                <div className="w-full space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tiêu đề</label>
                    <input 
                      type="text" 
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full p-2 bg-secondary/50 border border-border rounded-[var(--radius-md)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nội dung</label>
                    <textarea 
                      value={editForm.content}
                      onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                      className="w-full p-2 bg-secondary/50 border border-border rounded-[var(--radius-md)] text-sm min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Loại</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                      className="w-full p-2 bg-secondary/50 border border-border rounded-[var(--radius-md)] text-sm"
                    >
                      <option value="SYSTEM">Hệ thống</option>
                      <option value="PROMOTION">Khuyến mãi</option>
                      <option value="ORDER">Đơn hàng</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setEditingNotif(null)}>Hủy</Button>
                    <Button size="sm" onClick={handleSaveEdit}>Lưu</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {notif.type === 'SYSTEM' && <Megaphone className="w-4 h-4 text-primary" />}
                      {notif.type === 'PROMOTION' && <Bell className="w-4 h-4 text-warning" />}
                      {notif.type === 'ORDER' && <Send className="w-4 h-4 text-success" />}
                      <span className="font-semibold text-foreground text-sm">{notif.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notif.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium pt-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Tất cả người dùng (Broadcast)
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(notif)}
                      className="w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Sửa</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(notif.id)}
                      className="text-danger border-danger/20 hover:bg-danger/10 hover:border-danger hover:text-danger w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Xóa</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationSender() {
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifType, setNotifType] = useState('SYSTEM');
  const [sendMode, setSendMode] = useState<'broadcast' | 'single'>('broadcast');
  const [targetUserId, setTargetUserId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Fetch users list for single send
  const [users, setUsers] = useState<any[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=100');
      setUsers(res.data.data || []);
    } catch {}
  };

  const handleSend = async () => {
    if (!notifTitle.trim() || !notifContent.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    if (sendMode === 'single' && !targetUserId) {
      toast.error('Vui lòng chọn người dùng nhận thông báo');
      return;
    }

    setIsSending(true);
    try {
      if (sendMode === 'broadcast') {
        await api.post('/notifications/broadcast', {
          title: notifTitle,
          content: notifContent,
          type: notifType,
        });
        toast.success('Đã gửi thông báo đến tất cả người dùng!');
      } else {
        await api.post('/notifications/send', {
          userId: targetUserId,
          title: notifTitle,
          content: notifContent,
          type: notifType,
        });
        toast.success('Đã gửi thông báo đến người dùng!');
      }
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
      // Reset form
      setNotifTitle('');
      setNotifContent('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gửi thông báo thất bại');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Send Mode */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Chế độ gửi</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSendMode('broadcast')}
            className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border transition-all ${
              sendMode === 'broadcast'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-foreground/20'
            }`}
          >
            <Users className={`w-5 h-5 ${sendMode === 'broadcast' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-left">
              <p className={`text-sm font-semibold ${sendMode === 'broadcast' ? 'text-primary' : 'text-foreground'}`}>
                Tất cả
              </p>
              <p className="text-[11px] text-muted-foreground">Gửi đến mọi người dùng</p>
            </div>
          </button>
          <button
            onClick={() => { setSendMode('single'); fetchUsers(); }}
            className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border transition-all ${
              sendMode === 'single'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-foreground/20'
            }`}
          >
            <User className={`w-5 h-5 ${sendMode === 'single' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-left">
              <p className={`text-sm font-semibold ${sendMode === 'single' ? 'text-primary' : 'text-foreground'}`}>
                Cá nhân
              </p>
              <p className="text-[11px] text-muted-foreground">Gửi đến 1 người dùng</p>
            </div>
          </button>
        </div>
      </div>

      {/* Target User (for single mode) */}
      {sendMode === 'single' && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Người nhận</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setShowUserSearch(true); }}
              onFocus={() => setShowUserSearch(true)}
              className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {showUserSearch && userSearch && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-[var(--radius-md)] shadow-lg z-50 max-h-48 overflow-y-auto">
                {users
                  .filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                  .slice(0, 8)
                  .map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setTargetUserId(u.id); setUserSearch(u.name + ' (' + u.email + ')'); setShowUserSearch(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors border-b border-border/50 last:border-b-0"
                    >
                      <span className="font-medium text-foreground">{u.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{u.email}</span>
                    </button>
                  ))}
                {users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Không tìm thấy người dùng</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Type */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Loại thông báo</label>
        <div className="flex gap-2">
          {[
            { value: 'SYSTEM', label: 'Hệ thống', icon: Megaphone },
            { value: 'PROMOTION', label: 'Khuyến mãi', icon: Bell },
            { value: 'ORDER', label: 'Đơn hàng', icon: Send },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setNotifType(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                notifType === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Tiêu đề thông báo</label>
        <input
          type="text"
          placeholder="Ví dụ: Giảm giá lớn cuối tuần"
          value={notifTitle}
          onChange={(e) => setNotifTitle(e.target.value)}
          className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Nội dung</label>
        <textarea
          rows={4}
          placeholder="Nội dung chi tiết thông báo..."
          value={notifContent}
          onChange={(e) => setNotifContent(e.target.value)}
          className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
      </div>

      {/* Preview */}
      {notifTitle && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Xem trước</label>
          <div className="p-4 bg-secondary/40 border border-border rounded-[var(--radius-lg)] space-y-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">{notifTitle}</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{notifContent || '...'}</p>
          </div>
        </div>
      )}

      {/* Send Button */}
      <div className="pt-8 border-t border-border mt-8 flex items-center gap-4">
        <Button
          onClick={handleSend}
          disabled={isSending || !notifTitle.trim() || !notifContent.trim()}
          className="rounded-full px-8 gap-2"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : sentSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSending ? 'Đang gửi...' : sentSuccess ? 'Đã gửi!' : sendMode === 'broadcast' ? 'Gửi cho tất cả' : 'Gửi thông báo'}
        </Button>
      </div>
    </div>
  );
}
