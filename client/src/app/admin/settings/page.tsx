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
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up">
      {/* Sidebar Settings Tabs */}
      <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-5 py-3.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="flex-1 card-elevated bg-card rounded-[var(--radius-xl)] border border-border p-6 sm:p-10">
        {activeTab === 'general' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="border-b border-border pb-6">
              <h2 className="font-heading text-2xl text-foreground mb-1.5">Cài đặt chung</h2>
              <p className="text-muted-foreground text-sm">Quản lý thông tin cơ bản của cửa hàng.</p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Tên cửa hàng</label>
                <input 
                  type="text" 
                  defaultValue="UltraShop - Neo E-commerce"
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Email liên hệ</label>
                <input 
                  type="email" 
                  defaultValue="contact@ultrashop.com"
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Số điện thoại hotline</label>
                <input 
                  type="text" 
                  defaultValue="0123 456 789"
                  className="w-full bg-background border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="pt-4 space-y-3">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="space-y-1 pr-4">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Chế độ bảo trì</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">Kích hoạt để tạm ẩn cửa hàng đối với khách hàng (chỉ admin truy cập được).</p>
                  </div>
                  <div className="relative shrink-0">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-8 border-t border-border mt-8">
              <Button className="rounded-full px-8">
                <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
              </Button>
            </div>
          </div>
        )}

        {activeTab !== 'general' && (
          <div className="min-h-[300px] flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
              <Globe className="w-8 h-8 text-muted-foreground animate-spin-slow" />
            </div>
            <h2 className="font-heading text-2xl text-foreground">Tính năng đang phát triển</h2>
            <p className="text-muted-foreground text-sm">Tab cài đặt này sẽ sớm ra mắt trong phiên bản tiếp theo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
