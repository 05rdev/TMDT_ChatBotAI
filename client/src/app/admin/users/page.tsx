'use client';

import React, { useState } from 'react';
import { Search, MoreVertical, Edit2, Trash2, ShieldCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock Data
const INITIAL_USERS = [
  { id: 'USR-001', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'ADMIN', status: 'ACTIVE', joinedAt: '2023-01-15' },
  { id: 'USR-002', name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'USER', status: 'ACTIVE', joinedAt: '2023-02-20' },
  { id: 'USR-003', name: 'Lê Văn C', email: 'levanc@gmail.com', role: 'USER', status: 'LOCKED', joinedAt: '2023-03-10' },
  { id: 'USR-004', name: 'Phạm Thị D', email: 'phamthid@gmail.com', role: 'USER', status: 'ACTIVE', joinedAt: '2023-04-05' },
  { id: 'USR-005', name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', role: 'USER', status: 'ACTIVE', joinedAt: '2023-05-12' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } 
        : u
    ));
  };

  const deleteUser = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(users.filter(u => u.id !== id));
    }
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
        <Button className="w-max px-8 h-12 text-sm font-bold shadow-[4px_4px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:translate-x-1 transition-all">
          Thêm người dùng mới
        </Button>
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
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b-2 border-foreground hover:bg-secondary transition-colors group">
                <td className="p-4 border-r-2 border-foreground font-black text-xs uppercase">{user.id}</td>
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
                    onClick={() => toggleStatus(user.id)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border-2 border-foreground transition-all hover:-translate-y-1 ${
                      user.status === 'ACTIVE' ? 'bg-emerald-400 text-emerald-950 shadow-[2px_2px_0px_0px_#059669]' : 'bg-red-400 text-red-950 shadow-[2px_2px_0px_0px_#dc2626]'
                    }`}
                  >
                    {user.status}
                  </button>
                </td>
                <td className="p-4 border-r-2 border-foreground text-xs font-bold text-muted-foreground uppercase">
                  {new Date(user.joinedAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 border-2 border-foreground bg-accent hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0px_0px_var(--foreground)]" title="Chỉnh sửa">
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
            {filteredUsers.length === 0 && (
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
    </div>
  );
}
