'use client';

import React, { useState } from 'react';
import { Save, Globe, Lock, Bell, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Chung', icon: Store },
    { id: 'security', name: 'Bảo mật', icon: Lock },
    { id: 'notifications', name: 'Thông báo', icon: Bell },
    { id: 'advanced', name: 'Nâng cao', icon: Globe },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Settings Tabs */}
      <div className="w-full lg:w-64 flex flex-col gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-4 border-2 font-bold uppercase tracking-widest text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] -translate-y-1 translate-x-1'
                : 'bg-background text-foreground border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--foreground)]'
            }`}
          >
            <tab.icon className="w-5 h-5 mr-3" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="flex-1 solid-card bg-background p-8">
        {activeTab === 'general' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-2">Cài đặt chung</h2>
              <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Quản lý thông tin cơ bản của cửa hàng.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground">Tên cửa hàng</label>
                <input 
                  type="text" 
                  defaultValue="UltraShop - Neo E-commerce"
                  className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground">Email liên hệ</label>
                <input 
                  type="email" 
                  defaultValue="contact@ultrashop.com"
                  className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground">Số điện thoại hotline</label>
                <input 
                  type="text" 
                  defaultValue="0123 456 789"
                  className="w-full bg-background border-2 border-foreground p-3 font-bold text-foreground focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground flex items-center justify-between">
                  <span>Chế độ bảo trì</span>
                  <input type="checkbox" className="w-5 h-5 accent-primary border-2 border-foreground" />
                </label>
                <p className="text-xs font-bold text-muted-foreground uppercase">Kích hoạt để tạm ẩn cửa hàng đối với khách hàng (chỉ admin truy cập được).</p>
              </div>
            </div>

            <div className="pt-8 border-t-4 border-foreground">
              <Button className="w-max px-8 h-12 text-sm font-bold shadow-[4px_4px_0px_0px_var(--foreground)] hover:-translate-y-1 hover:translate-x-1 transition-all">
                <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
              </Button>
            </div>
          </div>
        )}

        {activeTab !== 'general' && (
          <div className="min-h-[300px] flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-accent border-4 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] flex items-center justify-center">
              <Globe className="w-8 h-8 text-foreground animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Tính năng đang phát triển</h2>
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Tab cài đặt này sẽ sớm ra mắt trong phiên bản tiếp theo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
