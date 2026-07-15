'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
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
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '',
    isActive: true,
    order: 0,
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
        setCurrentBanner((prev) => ({ ...prev, imageUrl: res.data.data.url }));
        toast.success('Tải ảnh lên thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
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

  const totalPages = Math.max(1, Math.ceil(banners.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedBanners = banners.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="admin-page animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Banner</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Cấu hình các banner quảng cáo trên trang chủ</p>
        </div>
        <Button
          onClick={() => {
            setCurrentBanner({ title: '', subtitle: '', imageUrl: '', link: '', isActive: true, order: banners.length });
            setIsEditing(true);
          }}
          className="shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4.5 h-4.5 mr-2" /> Thêm Banner mới
        </Button>
      </div>

      {isEditing && (
        <div className="admin-card p-4 sm:p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-semibold flex items-center text-foreground">
              {currentBanner.id ? <Edit className="w-5 h-5 mr-2 text-primary" /> : <Plus className="w-5 h-5 mr-2 text-primary" />}
              {currentBanner.id ? 'Chỉnh sửa Banner' : 'Tạo Banner mới'}
            </h2>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-secondary rounded-[8px] transition-colors">
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
                  onChange={(e) => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                  className="w-full bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Ví dụ: Siêu ưu đãi mùa hè"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Tiêu đề phụ</label>
                <input
                  type="text"
                  value={currentBanner.subtitle || ''}
                  onChange={(e) => setCurrentBanner({ ...currentBanner, subtitle: e.target.value })}
                  className="w-full bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Ví dụ: Giảm giá lên đến 50%"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Link liên kết</label>
                <input
                  type="text"
                  value={currentBanner.link || ''}
                  onChange={(e) => setCurrentBanner({ ...currentBanner, link: e.target.value })}
                  className="w-full bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Ví dụ: /shop hoặc /product/iphone-15"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">URL hình ảnh hoặc tải lên</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={currentBanner.imageUrl || ''}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, imageUrl: e.target.value })}
                    className="flex-1 bg-secondary/50 border border-border px-4 py-2.5 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm min-w-0"
                    placeholder="https://example.com/banner.jpg"
                  />
                  <label className="cursor-pointer flex items-center justify-center bg-secondary border border-border rounded-[8px] px-4 py-2.5 hover:bg-secondary/80 transition-colors">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={currentBanner.order}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, order: parseInt(e.target.value) })}
                    className="w-full bg-secondary/50 border border-border px-4 py-2.5 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-center">
                  <label className="text-sm font-semibold text-foreground mb-1">Trạng thái</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentBanner.isActive}
                      onChange={(e) => setCurrentBanner({ ...currentBanner, isActive: e.target.checked })}
                      className="w-4.5 h-4.5 accent-primary cursor-pointer"
                    />
                    <span className="text-sm font-medium text-muted-foreground">{currentBanner.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-[8px] p-4 sm:p-6 border border-dashed border-border min-h-[200px] flex flex-col items-center justify-center text-center">
            {currentBanner.imageUrl ? (
              <div className="w-full relative rounded-[8px] overflow-hidden shadow-lg border border-border aspect-[16/9] sm:aspect-[21/9]">
                <img src={currentBanner.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-8">
                  <h3 className="text-lg sm:text-3xl font-bold mb-2">{currentBanner.title}</h3>
                  <p className="text-sm sm:text-lg opacity-90">{currentBanner.subtitle}</p>
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

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
            <Button onClick={handleSave} className="px-8 shadow-md">
              <Save className="w-4 h-4 mr-2" /> {currentBanner.id ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Đang tải danh sách banner...</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          {banners.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-[8px] m-4">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Chưa có banner nào</h3>
              <p className="text-sm text-muted-foreground mt-1">Hãy tạo banner đầu tiên để làm nổi bật trang chủ.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[220px_minmax(260px,1fr)_130px_90px_180px_180px] items-center gap-4 border-b border-border bg-secondary/40 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <span>Ảnh banner</span>
                  <span>Nội dung</span>
                  <span>Trạng thái</span>
                  <span>Thứ tự</span>
                  <span>Liên kết</span>
                  <span className="text-right">Thao tác</span>
                </div>

                <div className="divide-y divide-border/50">
                  {paginatedBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className="group grid grid-cols-[220px_minmax(260px,1fr)_130px_90px_180px_180px] items-center gap-4 px-4 py-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="w-48 aspect-[16/9] bg-secondary rounded-[8px] overflow-hidden border border-border shrink-0 shadow-sm">
                        <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-foreground truncate">{banner.title || 'Không có tiêu đề'}</h3>
                        <p className="text-sm text-muted-foreground truncate mt-1">{banner.subtitle || 'Không có mô tả phụ'}</p>
                      </div>

                      <div>
                        {banner.isActive ? (
                          <span className="inline-flex items-center text-[10px] font-bold bg-success/10 text-success px-2 py-1 rounded-full uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Đang hiện
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold bg-muted text-muted-foreground px-2 py-1 rounded-full uppercase tracking-wider">
                            <AlertCircle className="w-3 h-3 mr-1" /> Đang ẩn
                          </span>
                        )}
                      </div>

                      <span className="text-sm font-semibold text-foreground">#{banner.order}</span>

                      <div className="min-w-0">
                        {banner.link ? (
                          <span className="text-primary flex items-center text-xs font-medium truncate">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5 opacity-60 shrink-0" /> {banner.link}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Không có link</span>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(banner)} className="hover:bg-primary/10 hover:text-primary">
                          <Edit className="w-4 h-4 mr-1.5" />
                          Sửa
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(banner.id)} className="hover:bg-danger/10 hover:text-danger">
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-pagination border-t border-border">
                  <span>
                    Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, banners.length)} của {banners.length} banner
                  </span>
                  <div className="flex items-center flex-wrap gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium ${
                          currentPage === pageNum ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary transition-colors'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      Tiếp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
