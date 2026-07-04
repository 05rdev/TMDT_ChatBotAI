'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Save, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { t } = useTranslation();
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Profile */}
        <aside className="lg:col-span-1 space-y-6">
           <div className="card-elevated rounded-[var(--radius-xl)] p-6 text-center space-y-4 bg-card">
             <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto overflow-hidden ring-4 ring-background shadow-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
             </div>
             <div>
               <h3 className="font-semibold text-lg text-foreground">{user.name}</h3>
               <p className="text-xs font-medium text-primary mt-1 bg-primary/10 px-3 py-1 rounded-full inline-block">{t('profile.goldMember')}</p>
             </div>
           </div>

           <nav className="card-elevated rounded-[var(--radius-xl)] p-3 flex flex-col space-y-1.5 bg-card">
             <Link href="/profile" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-primary bg-primary/10 transition-colors">
               {t('profile.accountInfo')}
             </Link>
             <Link href="/profile/orders" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
               {t('profile.orderHistory')}
             </Link>
             <Link href="/profile/wishlist" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
               {t('profile.favoriteProducts')}
             </Link>
           </nav>
        </aside>

        {/* Main Area */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="font-heading text-3xl text-foreground">{t('profile.accountInfo')}</h1>
            <p className="text-muted-foreground text-sm mt-1.5">{t('profile.accountInfoDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Cập nhật thông tin */}
            <div className="card-elevated rounded-[var(--radius-xl)] p-8 border border-border bg-card">
              <h2 className="text-lg font-semibold mb-6 flex items-center text-foreground">
                <User className="w-5 h-5 mr-2 text-primary" /> {t('profile.basicInfo')}
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t('profile.emailLabel')}</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled
                    className="w-full bg-secondary/50 border border-border px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed rounded-[var(--radius-md)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t('profile.fullName')}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all rounded-[var(--radius-md)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t('profile.avatarUrl')}</label>
                  <input 
                    type="text" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all rounded-[var(--radius-md)]"
                    placeholder="https://..."
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isUpdatingProfile}
                  className="w-full mt-2"
                >
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {t('profile.saveInfo')}</>}
                </Button>
              </form>
            </div>

            {/* Form Đổi mật khẩu */}
            <div className="card-elevated rounded-[var(--radius-xl)] p-8 border border-border bg-card">
              <h2 className="text-lg font-semibold mb-6 flex items-center text-foreground">
                <Lock className="w-5 h-5 mr-2 text-danger" /> {t('profile.changePassword')}
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t('profile.oldPassword')}</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-danger/20 transition-all rounded-[var(--radius-md)]"
                    placeholder={t('profile.oldPasswordPlaceholder')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t('profile.newPassword')}</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-danger/20 transition-all rounded-[var(--radius-md)]"
                    placeholder={t('profile.newPasswordPlaceholder')}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-2 bg-danger hover:bg-danger/90 text-white"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {t('profile.updatePassword')}</>}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
