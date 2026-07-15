'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, Loader2, Lock, Save, User, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }

  return fallback;
};

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatar(user.avatar || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.avatarInvalidType'));
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('profile.avatarTooLarge'));
      e.target.value = '';
      return;
    }

    if (avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setSelectedAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const clearSelectedAvatar = () => {
    if (avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setSelectedAvatarFile(null);
    setAvatarPreview(avatar);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await api.put('/auth/profile', { name, phone, address, avatar });
      let updatedUser = res.data.data;

      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', selectedAvatarFile);
        const avatarRes = await api.post('/auth/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedUser = avatarRes.data.data;
      }

      if (res.data.success) {
        toast.success('Cập nhật thông tin thành công');
        setUser(updatedUser);
        setAvatar(updatedUser.avatar || '');
        setAvatarPreview(updatedUser.avatar || '');
        setSelectedAvatarFile(null);
        if (avatarInputRef.current) {
          avatarInputRef.current.value = '';
        }
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Cập nhật thất bại'));
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Đổi mật khẩu thất bại'));
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
        <aside className="lg:col-span-1 space-y-6">
          <div className="card-elevated rounded-[var(--radius-xl)] p-6 text-center space-y-4 bg-card">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto overflow-hidden ring-4 ring-background shadow-sm">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{user.name}</h3>
              <p className="text-xs font-medium text-primary mt-1 bg-primary/10 px-3 py-1 rounded-full inline-block">
                {t('profile.goldMember')}
              </p>
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

        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="font-heading text-3xl text-foreground">{t('profile.accountInfo')}</h1>
            <p className="text-muted-foreground text-sm mt-1.5">{t('profile.accountInfoDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <label className="text-sm font-medium text-foreground">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all rounded-[var(--radius-md)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Địa chỉ</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all rounded-[var(--radius-md)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('profile.avatarImage')}</label>
                  <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border bg-background p-4">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-background shadow-sm">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarSelect}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-secondary px-3 py-2 text-sm font-semibold text-foreground hover:bg-border transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          {t('profile.chooseAvatar')}
                        </button>
                        {selectedAvatarFile && (
                          <button
                            type="button"
                            onClick={clearSelectedAvatar}
                            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-danger transition-colors"
                          >
                            <X className="w-4 h-4" />
                            {t('profile.cancelAvatar')}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{t('profile.avatarHelp')}</p>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isUpdatingProfile} className="w-full mt-2">
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {t('profile.saveInfo')}</>}
                </Button>
              </form>
            </div>

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
                <Button type="submit" className="w-full mt-2 bg-danger hover:bg-danger/90 text-white" disabled={isUpdatingPassword}>
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
