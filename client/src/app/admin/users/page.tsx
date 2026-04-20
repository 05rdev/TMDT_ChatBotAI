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
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
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
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa');
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center bg-background border-2 border-foreground p-1 shadow-[2px_2px_0px_0px_var(--foreground)] w-full max-w-md">
          <div className="px-3 text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            className="bg-transparent border-none focus:outline-none text-sm font-bold w-full py-2 placeholder:font-normal text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="solid-card bg-background overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-foreground bg-accent text-foreground uppercase tracking-widest text-xs font-black">
              <th className="p-4 border-r-2 border-foreground">ID</th>
              <th className="p-4 border-r-2 border-foreground">Người dùng</th>
              <th className="p-4 border-r-2 border-foreground">Vai trò</th>
              <th className="p-4 border-r-2 border-foreground text-center">Trạng thái</th>
              <th className="p-4 border-r-2 border-foreground">Ngày tham gia</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="border-b-2 border-foreground hover:bg-secondary transition-colors group">
                <td className="p-4 border-r-2 border-foreground font-black text-xs uppercase">
                  <span className="truncate max-w-[80px] inline-block">{user.id.slice(0, 8)}</span>
                </td>
                <td className="p-4 border-r-2 border-foreground">
                  <p className="font-bold text-foreground text-sm uppercase">{user.name}</p>
                  <p className="text-xs font-bold text-muted-foreground mt-1">{user.email}</p>
                </td>
                <td className="p-4 border-r-2 border-foreground">
                  <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border border-foreground inline-flex items-center gap-1 ${
                    user.role === 'ADMIN' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
                  }`}>
                    {user.role === 'ADMIN' && <ShieldCheck className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 border-r-2 border-foreground text-center">
                  <button
                    onClick={() => toggleStatus(user)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border-2 border-foreground transition-all hover:-translate-y-1 ${
                      user.isActive ? 'bg-emerald-400 text-emerald-950 shadow-[2px_2px_0px_0px_#059669]' : 'bg-red-400 text-red-950 shadow-[2px_2px_0px_0px_#dc2626]'
                    }`}
                  >
                    {user.isActive ? 'ACTIVE' : 'LOCKED'}
                  </button>
                </td>
                <td className="p-4 border-r-2 border-foreground text-xs font-bold text-muted-foreground uppercase">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2 transition-opacity">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 border-2 border-foreground bg-accent hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 border-2 border-foreground bg-accent hover:bg-red-500 hover:text-white transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]"
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
                <td colSpan={6} className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <UserX className="w-12 h-12" />
                    <p className="font-bold uppercase tracking-widest">Không tìm thấy khách hàng nào</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditUser(null); }}
        onSuccess={fetchUsers}
        user={editUser}
      />
    </div>
  );
}
