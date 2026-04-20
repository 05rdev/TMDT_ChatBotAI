'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Save, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await api.put('/auth/profile', { name, avatar });
      if (res.data.success) {
        toast.success('Cập nhật thông tin thành công');
        setUser(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      return toast.error('Vui lòng nhập đầy đủ mật khẩu');
    }
    try {
      setIsUpdatingPassword(true);
      const res = await api.put('/auth/change-password', { oldPassword, newPassword });
      if (res.data.success) {
        toast.success('Đổi mật khẩu thành công');
        setOldPassword('');
        setNewPassword('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Profile */}
        <aside className="lg:col-span-1 space-y-6">
           <div className="glass-card rounded-3xl p-6 text-center space-y-4">
             <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/50 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
             </div>
             <div>
               <h3 className="font-bold text-foreground">{user.name}</h3>
               <p className="text-sm text-muted-foreground mt-1">Thành viên Hạng Vàng</p>
             </div>
           </div>

           <nav className="glass-card rounded-3xl p-4 flex flex-col space-y-2">
             <Link href="/profile" className="px-4 py-3 rounded-xl text-sm font-bold text-emerald-500 bg-emerald-500/10 transition-colors">
               Thông tin tài khoản
             </Link>
             <Link href="/profile/orders" className="px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted/10 transition-colors">
               Lịch sử đơn hàng
             </Link>
             <Link href="/profile/wishlist" className="px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted/10 transition-colors">
               Sản phẩm yêu thích
             </Link>
           </nav>
        </aside>

        {/* Main Area */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Thông tin tài khoản</h1>
            <p className="text-muted-foreground text-sm mt-1">Cập nhật thông tin cá nhân và bảo mật tài khoản.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Cập nhật thông tin */}
            <div className="glass-card rounded-3xl p-8 border-border">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" /> Thông tin cơ bản
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Email (Không thể đổi)</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled
                    className="w-full bg-muted/20 border-2 border-border p-3 font-bold text-muted-foreground cursor-not-allowed rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1 uppercase tracking-wider">Họ và tên</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border-2 border-border p-3 font-bold text-foreground focus:outline-none focus:border-primary transition-all rounded-xl"
                    placeholder="Nhập họ và tên..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1 uppercase tracking-wider">URL Ảnh đại diện (Tùy chọn)</label>
                  <input 
                    type="text" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-background border-2 border-border p-3 font-bold text-foreground focus:outline-none focus:border-primary transition-all rounded-xl"
                    placeholder="https://..."
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isUpdatingProfile}
                  className="w-full h-12 shadow-[4px_4px_0px_0px_var(--foreground)] mt-4"
                >
                  {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Lưu thông tin</>}
                </Button>
              </form>
            </div>

            {/* Form Đổi mật khẩu */}
            <div className="glass-card rounded-3xl p-8 border-border">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-red-500" /> Đổi mật khẩu
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1 uppercase tracking-wider">Mật khẩu cũ</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-background border-2 border-border p-3 font-bold text-foreground focus:outline-none focus:border-red-500 transition-all rounded-xl"
                    placeholder="Nhập mật khẩu hiện tại..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1 uppercase tracking-wider">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-background border-2 border-border p-3 font-bold text-foreground focus:outline-none focus:border-red-500 transition-all rounded-xl"
                    placeholder="Nhập mật khẩu mới..."
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 shadow-[4px_4px_0px_0px_var(--foreground)] mt-4 bg-red-500 hover:bg-red-600 text-white"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Cập nhật mật khẩu</>}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
