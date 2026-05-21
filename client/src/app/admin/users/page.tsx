'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, ShieldCheck, UserX, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import UserEditModal from './UserEditModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (user: User) => {
    try {
      const res = await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
      if (res.data.success) {
        setUsers(users.map(u =>
          u.id === user.id ? { ...u, isActive: !user.isActive } : u
        ));
        toast.success(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
      toast.error(msg);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác này sẽ vô hiệu hóa tài khoản.')) {
      try {
        const res = await api.delete(`/admin/users/${id}`);
        if (res.data.success) {
          setUsers(users.filter(u => u.id !== id));
          toast.success('Đã xóa người dùng');
        }
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Có lỗi xảy ra khi xóa';
        toast.error(msg);
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Người dùng</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý tài khoản khách hàng và phân quyền.</p>
        </div>
        
        <div className="flex items-center bg-card border border-border rounded-[var(--radius-lg)] shadow-sm px-3 w-full sm:w-80">
          <Search className="w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm email, tên..."
            className="bg-transparent border-none focus:outline-none text-sm w-full py-2.5 pl-3 text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card-elevated bg-card rounded-[var(--radius-xl)] border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">ID</th>
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
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p className="font-medium text-sm">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                    <span className="truncate max-w-[80px] inline-block">{user.id.slice(0, 8)}</span>
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
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[var(--radius-md)] transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-[var(--radius-md)] transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <UserX className="w-10 h-10 opacity-50" />
                      <p className="font-medium text-sm">Không tìm thấy khách hàng nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
