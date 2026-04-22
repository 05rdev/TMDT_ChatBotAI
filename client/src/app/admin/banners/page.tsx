'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  ExternalLink, MoveUp, MoveDown, CheckCircle2, AlertCircle,
  Upload, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  order: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners');
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentBanner.imageUrl) {
      toast.error('Vui lòng cung cấp hình ảnh cho banner');
      return;
    }

    const payload = { ...currentBanner, title: currentBanner.title || '' };

    try {
      if (payload.id) {
        await api.put(`/banners/${payload.id}`, payload);
        toast.success('Cập nhật banner thành công');
      } else {
        await api.post('/banners', payload);
        toast.success('Thêm banner mới thành công');
      }
      setIsEditing(false);
      setCurrentBanner({ title: '', subtitle: '', imageUrl: '', link: '', isActive: true, order: 0 });
      fetchBanners();
    } catch (err) {
      toast.error('Lỗi khi lưu banner');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/banners/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setCurrentBanner(prev => ({ ...prev, imageUrl: res.data.data.url }));
        toast.success('Tải ảnh lên thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading the same file again if needed
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Đã xóa banner');
      fetchBanners();
    } catch (err) {
      toast.error('Lỗi khi xóa banner');
    }
  };

  const handleEdit = (banner: Banner) => {
    setCurrentBanner(banner);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Banner</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Cấu hình các banner quảng cáo trên trang chủ</p>
        </div>
        <Button onClick={() => {
          setCurrentBanner({ title: '', subtitle: '', imageUrl: '', link: '', isActive: true, order: banners.length });
          setIsEditing(true);
        }} className="shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4.5 h-4.5 mr-2" /> Thêm Banner mới
        </Button>
      </div>

      {isEditing && (
        <div className="card-elevated bg-card p-6 rounded-[var(--radius-xl)] border border-border space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-semibold flex items-center text-foreground">
              {currentBanner.id ? <Edit className="w-5 h-5 mr-2 text-primary" /> : <Plus className="w-5 h-5 mr-2 text-primary" />}
              {currentBanner.id ? 'Chỉnh sửa Banner' : 'Tạo Banner mới'}
            </h2>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Tiêu đề chính</label>
                <input 
                  type="text" 
                  value={currentBanner.title} 
                  onChange={e => setCurrentBanner({...currentBanner, title: e.target.value})}
                  className="w-full bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Ví dụ: Siêu ưu đãi Mùa Hè"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Tiêu đề phụ</label>
                <input 
                  type="text" 
                  value={currentBanner.subtitle || ''} 
                  onChange={e => setCurrentBanner({...currentBanner, subtitle: e.target.value})}
                  className="w-full bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Ví dụ: Giảm giá lên đến 50% cho tất cả sản phẩm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Link liên kết</label>
                <input 
                  type="text" 
                  value={currentBanner.link || ''} 
                  onChange={e => setCurrentBanner({...currentBanner, link: e.target.value})}
                  className="w-full bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Ví dụ: /shop hoặc /product/iphone-15"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">URL Hình ảnh hoặc Tải lên</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={currentBanner.imageUrl || ''} 
                    onChange={e => setCurrentBanner({...currentBanner, imageUrl: e.target.value})}
                    className="flex-1 bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    placeholder="https://example.com/banner.jpg"
                  />
                  <label className="cursor-pointer flex items-center justify-center bg-secondary border border-border rounded-[var(--radius-md)] px-4 hover:bg-secondary/80 transition-colors">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Thứ tự</label>
                  <input 
                    type="number" 
                    value={currentBanner.order} 
                    onChange={e => setCurrentBanner({...currentBanner, order: parseInt(e.target.value)})}
                    className="w-full bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-center">
                   <label className="text-sm font-semibold text-foreground mb-1">Trạng thái</label>
                   <div className="flex items-center space-x-2">
                     <input 
                        type="checkbox" 
                        checked={currentBanner.isActive}
                        onChange={e => setCurrentBanner({...currentBanner, isActive: e.target.checked})}
                        className="w-4.5 h-4.5 accent-primary cursor-pointer"
                      />
                      <span className="text-sm font-medium text-muted-foreground">{currentBanner.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-[var(--radius-lg)] p-6 border border-dashed border-border min-h-[200px] flex flex-col items-center justify-center text-center">
            {currentBanner.imageUrl ? (
              <div className="w-full relative rounded-[var(--radius-md)] overflow-hidden shadow-lg border border-border aspect-[21/9]">
                <img src={currentBanner.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-8">
                   <h3 className="text-3xl font-bold mb-2">{currentBanner.title}</h3>
                   <p className="text-lg opacity-90">{currentBanner.subtitle}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto border border-border">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Nhập URL hình ảnh để xem trước Banner</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
            <Button onClick={handleSave} className="px-8 shadow-md">
              <Save className="w-4 h-4 mr-2" /> {currentBanner.id ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted-foreground">Đang tải danh sách banner...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {banners.length === 0 ? (
            <div className="text-center py-20 card-elevated bg-card rounded-[var(--radius-xl)] border-2 border-dashed border-border">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Chưa có banner nào</h3>
              <p className="text-sm text-muted-foreground mt-1">Hãy tạo banner đầu tiên để làm nổi bật trang chủ của bạn</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div 
                key={banner.id} 
                className="group card-elevated-hover bg-card p-4 rounded-[var(--radius-xl)] border border-border flex items-center space-x-6 transition-all"
              >
                <div className="w-48 aspect-[16/9] bg-secondary rounded-[var(--radius-lg)] overflow-hidden border border-border shrink-0 shadow-sm">
                  <img src={banner.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-bold text-lg text-foreground truncate">{banner.title || 'Không có tiêu đề'}</h3>
                    {banner.isActive ? (
                      <span className="flex items-center text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3 mr-1" /> Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-2">{banner.subtitle}</p>
                  <div className="flex items-center space-x-4 text-xs font-medium">
                    <span className="text-muted-foreground flex items-center">
                       <ImageIcon className="w-3.5 h-3.5 mr-1.5 opacity-60" /> Thứ tự: {banner.order}
                    </span>
                    {banner.link && (
                      <span className="text-primary flex items-center">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5 opacity-60" /> {banner.link}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(banner)} className="hover:bg-primary/10 hover:text-primary">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(banner.id)} className="hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
