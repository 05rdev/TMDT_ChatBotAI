'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, ShieldCheck, UserX, Loader2, Filter, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import UserEditModal from './UserEditModal';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }

  return fallback;
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [roleFilter, setRoleFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/users', {
        params: {
          page,
          limit,
          search: debouncedSearch || undefined,
          role: roleFilter || undefined,
        },
      });
      if (res.data.success) {
        setUsers(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
          setTotal(res.data.pagination.total);
        }
      }
    } catch {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      const res = await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
      if (res.data.success) {
        setUsers(users.map(u =>
          u.id === user.id ? { ...u, isActive: !user.isActive } : u
        ));
        toast.success(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      }
    } catch (error: unknown) {
        const msg = getErrorMessage(error, 'Có lỗi xảy ra khi cập nhật trạng thái');
      toast.error(msg);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác này sẽ vô hiệu hóa tài khoản.')) {
      try {
        const res = await api.delete(`/admin/users/${id}`);
        if (res.data.success) {
          toast.success('Đã xóa người dùng');
          fetchUsers();
        }
      } catch (error: unknown) {
        const msg = getErrorMessage(error, 'Có lỗi xảy ra khi xóa');
        toast.error(msg);
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  // Generate smart page numbers (show pages around current page)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;

      if (end > totalPages) {
        end = totalPages;
        start = end - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  };

  return (
    <div className="admin-page">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Người dùng</h1>
          <p className="text-sm text-muted-foreground mt-1">Tổng cộng {total} tài khoản trên UltraShop.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="relative flex-1 min-w-full sm:min-w-[260px] max-w-md">
          <Search className="w-4.5 h-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm email, tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-10 pr-4 py-2.5"
          />
        </div>

        <Button
          variant={isFilterOpen ? "primary" : "outline"}
          className="flex items-center transition-all"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Lọc
        </Button>
      </div>

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="admin-card p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vai trò</label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full bg-background border border-border rounded-[var(--radius-md)] p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>

          {(roleFilter || searchTerm) && (
            <div className="col-span-1 sm:col-span-3 flex justify-end">
              <button
                onClick={() => {
                  setRoleFilter('');
                  setSearchTerm('');
                  setPage(1);
                }}
                className="text-xs font-bold text-danger hover:underline uppercase tracking-wider transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="admin-table-card">
        <div className="admin-table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap text-center">Avatar</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Người dùng</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Vai trò</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Ngày tham gia</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p className="font-medium text-sm">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <UserX className="w-10 h-10 opacity-50" />
                      <p className="font-medium text-sm">Không tìm thấy khách hàng nào</p>
                    </div>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                    <span className="truncate max-w-[80px] inline-block">{user.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-secondary ring-2 ring-background shadow-sm">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || user.email} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full inline-flex items-center gap-1.5 ${
                      user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'
                    }`}>
                      {user.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleStatus(user)}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all ${
                        user.isActive 
                          ? 'bg-success/10 text-success hover:bg-success/20' 
                          : 'bg-danger/10 text-danger hover:bg-danger/20'
                      }`}
                    >
                      {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[var(--radius-md)] transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-[var(--radius-md)] transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="admin-pagination">
          <span>Trang {page} / {totalPages} — Tổng {total} người dùng</span>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Trước
            </button>
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium ${
                  page === pageNum
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-secondary transition-colors'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>

      <UserEditModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditUser(null); }}
        onSuccess={fetchUsers}
        user={editUser}
      />
    </div>
  );
}
