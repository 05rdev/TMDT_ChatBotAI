'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {children}
      </main>

      {/* AI Assistant Neo-Brutalist Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link href="/ai-hub" className="group relative flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground border-2 border-foreground transition-transform hover:-translate-y-1 hover:translate-x-1 active:translate-y-0 active:translate-x-0"
             style={{ boxShadow: '4px 4px 0px 0px var(--foreground)' }}>
          <div className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M4 6h16v12H4z M9 10h.01M15 10h.01M9 14h6" />
          </svg>
          {/* Notification dot */}
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent border-2 border-foreground animate-pulse" />
        </Link>
      </div>
    </>
  );
}
